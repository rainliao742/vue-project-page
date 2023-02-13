"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _default = {
  props: ["deleteProduct", "tempProduct", "initialProduct"],
  template: "\n\t\t<div class=\"modal-dialog\">\n\t\t\t<div class=\"modal-content border-0\">\n\t\t\t\t<div class=\"modal-header bg-danger text-white\">\n\t\t\t\t\t<h5 id=\"delProductModalLabel\" class=\"modal-title\">\n\t\t\t\t\t\t<span>\u522A\u9664\u7522\u54C1</span>\n\t\t\t\t\t</h5>\n\t\t\t\t\t<button type=\"button\" class=\"btn-close\" data-bs-dismiss=\"modal\"\n\t\t\t\t\t\taria-label=\"Close\"></button>\n\t\t\t\t</div>\n\t\t\t\t<div class=\"modal-body\">\n\t\t\t\t\t\u662F\u5426\u522A\u9664\n\t\t\t\t\t<strong class=\"text-danger\">{{ tempProduct.title }}</strong> \u5546\u54C1(\u522A\u9664\u5F8C\u5C07\u7121\u6CD5\u6062\u5FA9)\u3002\n\t\t\t\t</div>\n\t\t\t\t<div class=\"modal-footer\">\n\t\t\t\t\t<button type=\"button\" class=\"btn btn-outline-secondary\"\n\t\t\t\t\t\tdata-bs-dismiss=\"modal\">\n\t\t\t\t\t\t\u53D6\u6D88\n\t\t\t\t\t</button>\n\t\t\t\t\t<button type=\"button\" class=\"btn btn-danger\" @click=\"deleteProduct\">\n\t\t\t\t\t\t\u78BA\u8A8D\u522A\u9664\n\t\t\t\t\t</button>\n\t\t\t\t</div>\n\t\t\t</div>\n\t\t</div>\t\n\t"
};
exports["default"] = _default;