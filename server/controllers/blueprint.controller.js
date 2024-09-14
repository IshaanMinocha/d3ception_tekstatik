import Blueprint from '../models/blueprint.model.js';

export const uploadBlueprint = async (req, res) => {
  try {
    const { fileName } = req.body;
    const newBlueprint = new Blueprint({ fileName });
    await newBlueprint.save();
    res.status(200).json({ success: true, message: 'Blueprint uploaded successfully', data: newBlueprint });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error uploading blueprint', error: error.message });
  }
};

export const submitBlueprintForm = async (req, res) => {
    try {
      const { height, breadth, length, floors } = req.body;
      const blueprint = new Blueprint(
        // { fileName: fileId },
        { height, breadth, length, floors },
        // { new: true, runValidators: true }
      );
      // if (!blueprint) {
      //   return res.status(404).json({ success: false, message: 'Blueprint not found' });
      // }
      await blueprint.save()
      res.status(200).json({ success: true, message: 'Blueprint form submitted successfully', blueprint });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error submitting blueprint form', error: error.message });
    }
  };