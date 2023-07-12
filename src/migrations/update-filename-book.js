module.exports = {
    up: function (queryInterface, Sequelize) {
        return queryInterface.addColumn("Books", "filename", Sequelize.STRING);
    },
    down: function (queryInterface, Sequelize) {
        return queryInterface.removeColumn("Books", "filename");
    },
};
