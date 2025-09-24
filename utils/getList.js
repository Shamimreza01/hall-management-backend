// getList.js (or wherever your getList is defined)

const getList = (
  Model,
  buildSearchObj,
  populateOptions = null,
  selectFields = null,
  sortOptions = null // <--- Add this new parameter
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

      // ✅ Add sorting if options exist <--- New logic here
      if (sortOptions) {
        query = query.sort(sortOptions);
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
