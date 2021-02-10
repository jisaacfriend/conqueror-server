const champImporter = require('./components/champImporter');

const execute = async () => {
  try {
    const importCount = await champImporter.importChampData();

    console.log(`Imported ${importCount} champion object(s)!`);
  } catch (err) {
    console.error(err);
  }
};

execute();