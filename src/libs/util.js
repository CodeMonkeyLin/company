let util = {

};
util.title = function (title) {
    title = title ? title + ' - Home' : '全国建筑企业资质查询';
    window.document.title = title;
};

export default util;