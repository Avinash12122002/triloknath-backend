const { validationResult } = require('express-validator');
const Consultation = require('../models/Consultation');

// @desc    Submit consultation from website form
// @route   POST /api/consultation
// @access  Public
const createConsultation = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const {
      firstName, lastName, email, phoneCode, phone, fullPhone,
      companyCountry, hiringCountry, services, headcount, industry,
      message, source, pageUrl, submittedAt, userAgent,
    } = req.body;

    const consultation = await Consultation.create({
      firstName, lastName, email, phoneCode, phone,
      fullPhone: fullPhone || `${phoneCode}${phone}`,
      companyCountry, hiringCountry, services, headcount, industry,
      message, source, pageUrl, submittedAt, userAgent,
    });

    res.status(201).json({
      success: true,
      message: 'Consultation submitted successfully.',
      id: consultation._id,
    });
  } catch (error) {
    console.error('Create consultation error:', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// @desc    Get all consultations (with search, filter, pagination)
// @route   GET /api/consultation
// @access  Private
const getAllConsultations = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      status = '',
      country = '',
      industry = '',
      service = '',
      sort = '-createdAt',
    } = req.query;

    const query = {};

    // Search
    if (search) {
      const regex = new RegExp(search, 'i');
      query.$or = [
        { firstName: regex },
        { lastName: regex },
        { email: regex },
        { phone: regex },
        { fullPhone: regex },
        { companyCountry: regex },
        { hiringCountry: regex },
        { message: regex },
      ];
    }

    // Filters
    if (status) query.status = status;
    if (country) query.companyCountry = new RegExp(country, 'i');
    if (industry) query.industry = new RegExp(industry, 'i');
    if (service) query.services = { $in: [new RegExp(service, 'i')] };

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const [consultations, total] = await Promise.all([
      Consultation.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Consultation.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      count: consultations.length,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
      consultations,
    });
  } catch (error) {
    console.error('Get consultations error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// @desc    Get single consultation
// @route   GET /api/consultation/:id
// @access  Private
const getConsultation = async (req, res) => {
  try {
    const consultation = await Consultation.findById(req.params.id);
    if (!consultation) {
      return res.status(404).json({ success: false, message: 'Consultation not found.' });
    }
    res.status(200).json({ success: true, consultation });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'Invalid ID format.' });
    }
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// @desc    Update consultation
// @route   PUT /api/consultation/:id
// @access  Private
const updateConsultation = async (req, res) => {
  try {
    const allowedFields = [
      'firstName', 'lastName', 'email', 'phone', 'fullPhone',
      'companyCountry', 'hiringCountry', 'services', 'headcount',
      'industry', 'message', 'status', 'notes', 'assignedTo',
    ];

    const updateData = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) updateData[field] = req.body[field];
    });

    const consultation = await Consultation.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!consultation) {
      return res.status(404).json({ success: false, message: 'Consultation not found.' });
    }

    res.status(200).json({ success: true, consultation });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'Invalid ID format.' });
    }
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// @desc    Delete consultation
// @route   DELETE /api/consultation/:id
// @access  Private
const deleteConsultation = async (req, res) => {
  try {
    const consultation = await Consultation.findByIdAndDelete(req.params.id);
    if (!consultation) {
      return res.status(404).json({ success: false, message: 'Consultation not found.' });
    }
    res.status(200).json({ success: true, message: 'Consultation deleted successfully.' });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'Invalid ID format.' });
    }
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// @desc    Get dashboard stats
// @route   GET /api/consultation/stats
// @access  Private
const getStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const [
      totalLeads,
      todayLeads,
      weekLeads,
      statusCounts,
      topHiringCountries,
      topIndustries,
      topServices,
      recentLeads,
      monthlyTrend,
    ] = await Promise.all([
      Consultation.countDocuments(),
      Consultation.countDocuments({ createdAt: { $gte: today, $lt: tomorrow } }),
      Consultation.countDocuments({ createdAt: { $gte: weekAgo } }),
      Consultation.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      Consultation.aggregate([
        { $group: { _id: '$hiringCountry', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
      ]),
      Consultation.aggregate([
        { $match: { industry: { $ne: '' } } },
        { $group: { _id: '$industry', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
      ]),
      Consultation.aggregate([
        { $unwind: '$services' },
        { $group: { _id: '$services', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      Consultation.find({})
        .sort({ createdAt: -1 })
        .limit(5)
        .select('firstName lastName email companyCountry hiringCountry status createdAt services'),
      Consultation.aggregate([
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
        { $limit: 12 },
      ]),
    ]);

    res.status(200).json({
      success: true,
      stats: {
        totalLeads,
        todayLeads,
        weekLeads,
        statusCounts,
        topHiringCountries,
        topIndustries,
        topServices,
        recentLeads,
        monthlyTrend,
      },
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// @desc    Export consultations as JSON for Excel download
// @route   GET /api/consultation/export
// @access  Private
const exportConsultations = async (req, res) => {
  try {
    const consultations = await Consultation.find({}).lean().sort({ createdAt: -1 });

    const data = consultations.map((c, i) => ({
      '#': i + 1,
      'First Name': c.firstName,
      'Last Name': c.lastName,
      'Email': c.email,
      'Phone': c.fullPhone || c.phone,
      'Company Country': c.companyCountry,
      'Hiring Country': c.hiringCountry,
      'Services': Array.isArray(c.services) ? c.services.join(', ') : c.services,
      'Headcount': c.headcount,
      'Industry': c.industry,
      'Status': c.status,
      'Message': c.message,
      'Source': c.source,
      'Notes': c.notes,
      'Submitted At': c.submittedAt,
      'Created At': new Date(c.createdAt).toLocaleString(),
    }));

    res.status(200).json({ success: true, count: data.length, data });
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ success: false, message: 'Server error during export.' });
  }
};

module.exports = {
  createConsultation,
  getAllConsultations,
  getConsultation,
  updateConsultation,
  deleteConsultation,
  getStats,
  exportConsultations,
};