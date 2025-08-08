const getList = (
  Model,
  buildSearchObj,
  populateOptions = null,
  selectFields = null
) => {
  return async (req, res) => {
    try {
      const searchObj = buildSearchObj(req);
      let query = Model.find(searchObj);

      // ✅ Select specific fields if given
      if (selectFields) {
        query = query.select(selectFields);
      }

      // ✅ Populate if options exist
      if (populateOptions) {
        query = query.populate(populateOptions);
      }

      const list = await query;

      if (!list) {
        return res.status(404).json({ message: "nothing found" });
      }

      res.status(200).json(list);
    } catch (error) {
      console.error("Error fetching list:", error);
      res.status(500).json({
        message: "Internal server error while getting list.",
        error: error.message,
      });
    }
  };
};

export default getList;
