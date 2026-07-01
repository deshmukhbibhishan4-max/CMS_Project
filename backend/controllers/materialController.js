const Material = require('../models/Material');

const getMaterials = async (req, res) => {
  try {
    const filter = {};
    if (req.query.course) filter.course = req.query.course;
    const materials = await Material.find(filter).populate('course', 'name').populate('uploadedBy', 'name');
    res.json(materials);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const uploadMaterial = async (req, res) => {
  try {
    const { title, description, course, fileType } = req.body;
    if (!req.file) return res.status(400).json({ message: 'File is required' });

    const material = await Material.create({
      title,
      description,
      course,
      fileType,
      fileUrl: `/uploads/${req.file.filename}`,
      uploadedBy: req.user._id,
    });

    res.status(201).json(material);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteMaterial = async (req, res) => {
  try {
    const material = await Material.findByIdAndDelete(req.params.id);
    if (!material) return res.status(404).json({ message: 'Material not found' });
    res.json({ message: 'Material deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getMaterials, uploadMaterial, deleteMaterial };
