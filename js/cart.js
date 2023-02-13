// 1.產品列表
// 2.單一產品細節(按鈕，顯示數量)
// 3.加入購物車(選擇數量)
// 4.購物車列表
// 5.調整數量
// 6.刪除品項
import { createApp } from "https://unpkg.com/vue@3/dist/vue.esm-browser.js";
const apiUrl = "https://vue3-course-api.hexschool.io";
const apiPath = "richliao"; //個人path

import formComponent from "../components/fromComponent.js";

//表單驗證功能定義規則
Object.keys(VeeValidateRules).forEach((rule) => {
  if (rule !== "default") {
    VeeValidate.defineRule(rule, VeeValidateRules[rule]);
  }
});

// 讀取外部的資源
VeeValidateI18n.loadLocaleFromURL("./zh_TW.json");

// Activate the locale
VeeValidate.configure({
  generateMessage: VeeValidateI18n.localize("zh_TW"),
  validateOnInput: true, // 調整為：輸入文字時，就立即進行驗證
});

const popupModal = {
  //取得ID，當ID變動時:呈現資料=>打開modal
  props: ["id", "addToCart", "openModal"],
  data() {
    return {
      modal: {}, //Bootstrap實體化物件用
      selectProduct: {},
      qty: 1, //預設數量
    };
  },
  template: `#userProductModal`,
  watch: {
    id() {
      //console.log("內層監聽的ID", this.id);
      if (this.id) {
        //如果id存在再去抓API
        axios
          .get(`${apiUrl}/v2/api/${apiPath}/product/${this.id}`)
          .then((res) => {
            //console.log("單一產品:", res.data.product);
            this.selectProduct = res.data.product; //取得的ＩＤ產品放到seleProduct
            //顯示Modal
            this.modal.show();
          })
          .catch((err) => {
            alert(err.data.message);
          });
      }
    },
  },
  methods: {
    hide() {
      this.modal.hide();
    }, //設定關閉
    show() {
      this.modal.show();
    }, //設定開啟
  },
  mounted() {
    //監聽DOM，當modal關閉時...要做其他事情
    this.$refs.modal.addEventListener("hidden.bs.modal", (event) => {
      //console.log("Modal被關閉了");
      this.openModal(""); //由外往內控制，讓本來被打開的ID清空
    });
    //呼叫bootstrap Modal
    this.modal = new bootstrap.Modal(this.$refs.modal);
  },
};

const app = Vue.createApp({
  data() {
    return {
      products: [],
      productId: "",
      cart: {},
      loading: "", //確認ＩＤ存在
      user: {
        email: "",
        name: "",
        address: "",
        phone: "",
      },
    };
  },
  components: {
    formComponent,
    popupModal,
  },
  methods: {
    getProducts() {
      axios
        .get(`${apiUrl}/v2/api/${apiPath}/products`)
        .then((res) => {
          // console.log(res.data);
          // console.log("產品列表:", res.data.products);
          this.products = [...res.data.products];
        })
        .catch((err) => {
          alert(err.response.data.message);
        });
    },
    openModal(id) {
      this.productId = id; //當選擇的產品ID等於遠端資料的ID
      this.loading = ""; //防止一直重複開啟
      // console.log("外層帶入ID", id);
      // this.$refs.popupModal.show();
    },
    addToCart(product_id, qty = 1) {
      //沿用API上的參數命名,數量設定預設為1
      const data = {
        product_id,
        qty,
      };
      axios
        .post(`${apiUrl}/v2/api/${apiPath}/cart`, { data }) //{data:data}遠端上傳data的資料格式
        .then((res) => {
          //console.log("加入購物車", res.data);
          this.$refs.popupModal.hide(); //加入購物車後，自動關閉視窗
          this.getCarts(); //更新購物車
          this.loading = ""; //防止一直連點加入購物車
        });
    },
    getCarts() {
      axios
        .get(`${apiUrl}/v2/api/${apiPath}/cart`) //取得購物車
        .then((res) => {
          //console.log("取得購物車", res.data.data);
          this.cart = res.data.data; //存取遠端購物車資料
        });
    },
    updateCartItem(item) {
      //帶入產品的ID,購物車ID
      const data = {
        product_id: item.product.id,
        qty: item.qty,
      };
      //console.log("產品ID&數量:", data, "購物車ID:", item.id);
      this.loading = item.id;
      axios
        .put(`${apiUrl}/v2/api/${apiPath}/cart/${item.id}`, { data })
        .then((res) => {
          //console.log("更新購物車", res.data);
          this.getCarts();
          //this.cart = res.data.data
          this.loading = ""; //防止一直重複更新
        });
    },
    deleteItem(item) {
      axios
        .delete(`${apiUrl}/v2/api/${apiPath}/cart/${item.id}`) //刪除物件
        .then((res) => {
          //console.log("刪除購物車", res.data);
          this.getCarts();
          this.loading = ""; //防止一直重複刪除
        });
    },
    deleteAllItem() {
      axios
        .delete(`${apiUrl}/v2/api/${apiPath}/carts`) //刪除物件
        .then((res) => {
          this.getCarts();
          this.loading = ""; //防止一直重複刪除
        });
    },
    onSubmit() {
      alert("送出訂單", this.user);
    },
    createOrder() {
      //開啟訂單還API--還沒套
      const order = this.user;
      axios
        .post(`${apiUrl}/api/${apiPath}/order`, { data: order })
        .then((res) => {
          alert(res.data.message);
          this.$refs.form.resetForm();
          this.getCart();
        })
        .catch((error) => {
          alert(error.data.message);
        });
    },
    isPhone(value) {
      const phoneNumber = /^(09)[0-9]{8}$/;
      return phoneNumber.test(value) ? true : "需要正確的電話號碼";
    },
  },
  created() {
    //console.log(this);
  },
  mounted() {
    this.getProducts();
    this.getCarts();
  },
});

app.component("VForm", VeeValidate.Form);
app.component("VField", VeeValidate.Field);
app.component("ErrorMessage", VeeValidate.ErrorMessage);

app.mount("#app");
