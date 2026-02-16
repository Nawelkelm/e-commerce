const { Sequelize } = require('sequelize');

module.exports = {
  up: async (queryInterface) => {
    // Check if column exists before adding
    const tableDescription = await queryInterface.describeTable('HomeSettings');
    
    if (!tableDescription.categoryIcons) {
      await queryInterface.addColumn('HomeSettings', 'categoryIcons', {
        type: Sequelize.JSONB,
        defaultValue: {},
        allowNull: true
      });
      
      console.log('✅ Column categoryIcons added to HomeSettings table');
    } else {
      console.log('ℹ️  Column categoryIcons already exists');
    }
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('HomeSettings', 'categoryIcons');
  }
};
