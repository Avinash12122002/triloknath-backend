const ContactForm = require('../models/ContactForm');

// Create Contact Form
const createContactFormService = async (data) => {
  const { phoneCode, phone, fullPhone } = data;

  return ContactForm.create({
    ...data,
    fullPhone: fullPhone || `${phoneCode}${phone}`,
  });
};

// Get All Contact Forms (Search, Filter, Pagination)
const getAllContactFormsService = async (queryParams) => {
  const {
    page = 1,
    limit = 10,
    search = '',
    status = '',
    country = '',
    industry = '',
    service = '',
    sort = '-createdAt',
  } = queryParams;

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

  const pageNum = Math.max(1, Number(page));
  const limitNum = Math.min(100, Math.max(1, Number(limit)));
  const skip = (pageNum - 1) * limitNum;

  const [contactForms, total] = await Promise.all([
    ContactForm.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limitNum)
      .lean(),

    ContactForm.countDocuments(query),
  ]);

  return {
    count: contactForms.length,
    total,
    page: pageNum,
    totalPages: Math.ceil(total / limitNum),
    contactForms,
  };
};

// Get Contact Form By ID
const getContactFormByIdService = (id) => {
  return ContactForm.findById(id);
};

// Update Contact Form
const updateContactFormService = async (id, data) => {
  const allowedFields = [
    'firstName',
    'lastName',
    'email',
    'phone',
    'phoneCode',
    'fullPhone',
    'companyCountry',
    'hiringCountry',
    'services',
    'headcount',
    'industry',
    'message',
    'status',
    'notes',
    'assignedTo',
  ];

  const updateData = {};

  allowedFields.forEach((field) => {
    if (data[field] !== undefined) {
      updateData[field] = data[field];
    }
  });

  // Regenerate full phone number if phone or phone code changes
  if (updateData.phoneCode !== undefined || updateData.phone !== undefined) {
    const phoneCode = updateData.phoneCode ?? data.phoneCode ?? '';
    const phone = updateData.phone ?? data.phone ?? '';

    updateData.fullPhone = `${phoneCode}${phone}`;
  }

  return ContactForm.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  });
};

// Delete Contact Form
const deleteContactFormService = (id) => {
  return ContactForm.findByIdAndDelete(id);
};

// Dashboard Stats
const getStatsService = async () => {
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

    ContactForm.countDocuments({
      createdAt: {
        $gte: today,
        $lt: tomorrow,
      },
    }),

    ContactForm.countDocuments({
      createdAt: {
        $gte: weekAgo,
      },
    }),

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

    ContactForm.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select(
        'firstName lastName email companyCountry hiringCountry status createdAt services'
      ),

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
      {
        $sort: {
          '_id.year': 1,
          '_id.month': 1,
        },
      },
      { $limit: 12 },
    ]),
  ]);

  return {
    totalLeads,
    todayLeads,
    weekLeads,
    statusCounts,
    topHiringCountries,
    topIndustries,
    topServices,
    recentLeads,
    monthlyTrend,
  };
};

// Export Contact Forms
const exportContactFormsService = async () => {
  const contactForms = await ContactForm.find()
    .lean()
    .sort({ createdAt: -1 });

  return contactForms.map((c, i) => ({
    '#': i + 1,
    'First Name': c.firstName,
    'Last Name': c.lastName,
    Email: c.email,
    Phone: c.fullPhone || c.phone,
    'Company Country': c.companyCountry,
    'Hiring Country': c.hiringCountry,
    Services: Array.isArray(c.services)
      ? c.services.join(', ')
      : c.services,
    Headcount: c.headcount,
    Industry: c.industry,
    Status: c.status,
    Message: c.message,
    Source: c.source,
    Notes: c.notes,
    'Submitted At': c.submittedAt,
    'Created At': new Date(c.createdAt).toLocaleString(),
  }));
};

module.exports = {
  createContactFormService,
  getAllContactFormsService,
  getContactFormByIdService,
  updateContactFormService,
  deleteContactFormService,
  getStatsService,
  exportContactFormsService,
};
