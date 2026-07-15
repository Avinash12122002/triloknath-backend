const { validationResult } = require('express-validator');
const ContactForm = require('../models/contactForm');

// @desc    Submit contactForm from website form
// @route   POST /api/contactForm
// @access  Public
const createContactForm = async (req, res) => {
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

    const contactForm = await ContactForm.create({
      firstName, lastName, email, phoneCode, phone,
      fullPhone: fullPhone || `${phoneCode}${phone}`,
      companyCountry, hiringCountry, services, headcount, industry,
      message, source, pageUrl, submittedAt, userAgent,
    });

    res.status(201).json({
      success: true,
      message: 'Contact Form submitted successfully.',
      id: contactForm._id,
    });
  } catch (error) {
    console.error('Create Contact Form error:', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// @desc    Get all contactForms (with search, filter, pagination)
// @route   GET /api/contactForm
// @access  Private
const getAllContactForms = async (req, res) => {
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

    const [contactForms, total] = await Promise.all([
      ContactForm.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      ContactForm.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      count: contactForms.length,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
      contactForms,
    });
  } catch (error) {
    console.error('Get Contact Form error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// @desc    Get single contactForm
// @route   GET /api/contactForm/:id
// @access  Private
const getContactForm = async (req, res) => {
  try {
    const contactForm = await ContactForm.findById(req.params.id);
    if (!contactForm) {
      return res.status(404).json({ success: false, message: 'Contact Form not found.' });
    }
    res.status(200).json({ success: true, contactForm });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'Invalid ID format.' });
    }
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// @desc    Update contactForm
// @route   PUT /api/contactForm/:id
// @access  Private
const updateContactForm = async (req, res) => {
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

    const contactForm = await ContactForm.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!contactForm) {
      return res.status(404).json({ success: false, message: 'Contact Form not found.' });
    }

    res.status(200).json({ success: true, contactForm });
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

// @desc    Delete contactForm
// @route   DELETE /api/contactForm/:id
// @access  Private
const deleteContactForm = async (req, res) => {
  try {
    const contactForm = await ContactForm.findByIdAndDelete(req.params.id);
    if (!contactForm) {
      return res.status(404).json({ success: false, message: 'Contact Form data not found.' });
    }
    res.status(200).json({ success: true, message: 'Contact Form data deleted successfully.' });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'Invalid ID format.' });
    }
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// @desc    Get dashboard stats
// @route   GET /api/contactForm/stats
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
      ContactForm.countDocuments(),
      ContactForm.countDocuments({ createdAt: { $gte: today, $lt: tomorrow } }),
      ContactForm.countDocuments({ createdAt: { $gte: weekAgo } }),
      ContactForm.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      ContactForm.aggregate([
        { $group: { _id: '$hiringCountry', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
      ]),
      ContactForm.aggregate([
        { $match: { industry: { $ne: '' } } },
        { $group: { _id: '$industry', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
      ]),
      ContactForm.aggregate([
        { $unwind: '$services' },
        { $group: { _id: '$services', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      ContactForm.find({})
        .sort({ createdAt: -1 })
        .limit(5)
        .select('firstName lastName email companyCountry hiringCountry status createdAt services'),
      ContactForm.aggregate([
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

// @desc    Export contactForms as JSON for Excel download
// @route   GET /api/contactForm/export
// @access  Private
const exportContactForms = async (req, res) => {
  try {
    const contactForms = await ContactForm.find({}).lean().sort({ createdAt: -1 });

    const data = contactForms.map((c, i) => ({
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
  createContactForm,
  getAllContactForms,
  getContactForm,
  updateContactForm,
  deleteContactForm,
  getStats,
  exportContactForms,
};