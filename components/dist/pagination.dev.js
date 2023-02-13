"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _default = {
  props: ["pages", "getProducts"],
  template: "\n\t<nav aria-label=\"Page navigation example\">\n\t\t<ul class=\"pagination\">\n\t\t\t<li class=\"page-item\"\n\t\t\t:class= \"{ disabled: !pages.has_pre }\"\n\t\t\t><!--\u7576\u5DF2\u7D93\u5230\u6700\u524D\u9801\u9762\u6642\uFF0C\u52A0\u4E0A\u4E0D\u80FD\u6309\u7684Class-->\n\t\t\t\t<a class=\"page-link\" href=\"#\" aria-label=\"Previous\"\n\t\t\t\t@click.prevent=\"getProducts(pages.current_page - 1)\"\n\t\t\t\t>\n\t\t\t\t\t<span aria-hidden=\"true\">&laquo;</span>\n\t\t\t\t\t<span class=\"sr-only\"></span>\n\t\t\t\t</a>\n\t\t\t</li>\n\t\t\t<li class=\"page-item\"\n\t\t\t\t:class= \"{ active: page === pages.current_page }\"\n\t\t\t\tv-for=\"page in pages.total_pages\" :key=\"page + 'page'\"\n\t\t\t><!--\u6293\u53D6\u9801\u78BC\u8CC7\u6599-->\n\t\t\t\t<a class=\"page-link\" href=\"#\"\n\t\t\t\t@click.prevent=\"$emit('change-page', page)\"\n\t\t\t\t>{{ page }}</a>\n\t\t\t\t<!--\u9EDE\u64CA\u5207\u63DB\u5230\u7576\u524D\u8CC7\u6599\u7684\u9801\u9762-->\n\t\t\t\t<!--props\u65B9\u6CD5 @click.prevent=\"getProducts(page)\"-->\n\t\t\t</li>\n\t\t\t<li class=\"page-item\"\n\t\t\t:class= \"{ disabled: !pages.has_next }\"\n\t\t\t><!--\u7576\u5DF2\u7D93\u5230\u6700\u5F8C\u9801\u9762\u6642\uFF0C\u52A0\u4E0A\u4E0D\u80FD\u6309\u7684Class-->\n\t\t\t\t<a class=\"page-link\" href=\"#\" aria-label=\"Next\"\n\t\t\t\t@click.prevent=\"getProducts(pages.current_page + 1)\"\n\t\t\t\t>\n\t\t\t\t\t<span aria-hidden=\"true\">&raquo;</span>\n\t\t\t\t\t<span class=\"sr-only\"></span>\n\t\t\t\t</a>\n\t\t\t</li>\n\t\t</ul>\n\t</nav>\n\t"
};
exports["default"] = _default;