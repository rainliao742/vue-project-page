//第四週元件匯入
import pagination from '../components/pagination.js';
import productModalTemp from '../components/productModalTemp.js'
import deleteProductModalTemp from '../components/deleteProductModalTemp.js';

const url = "https://vue3-course-api.hexschool.io/v2"; //公用加入點
const path = "richliao"; //個人path

let productModal = {}; //新增、編輯產品使用
let deleteProductModal = {}; //刪除產品使用

//第三週流程
// 1.post(發送資料)
// 2.put(編輯資料)
// 3.delete(刪除資料)
// 4.驗證流程是否正確
// 5.Bootstrap Modal控制
// 6.新增多圖的資料判斷

//第四週流程
//1.先不要想怎麼拆元件
//2.確保元件拆完後是正確的
//3.越常用的越不好考、越少用得越會考 => emit傳值

const app = Vue.createApp({
  data() {
    return {
      products: [], // 擺放遠端的資料用
      tempProduct: {
        imagesUrl: [], // 放遠端的圖片
      }, //暫存資料區,當下選取的物件資料用
      isNew: false, //是否為新增
      page: {},//存入分頁
    };
  },
  methods: {
    getProducts(page = 1) {//取得參數page當前的頁面 page=1參數預設值
      //取的遠端產品資料
      axios
        .get(`${url}/api/${path}/admin/products/?page=${page}`) //有分頁位置,productAll（沒有分頁) //取得參數page當前的頁面
        .then((res) => {
          this.products = [...res.data.products]; //讀取遠端data裡的products,並且淺拷貝,放入空陣列products
          this.page = res.data.pagination; //讀取遠端的data裡的pagination(分頁資訊)
          //console.log(res.data);
        })
        .catch((err) => {
          alert(err.data.message);
        });
    },
    updateProduct() {
      let upUrl = `${url}/api/${path}/admin/product`;
      //用 this.isNew 判斷新增(Post)或編輯(Put)更動連接API方式
      let method = "post";
      if (!this.isNew) {
        upUrl = `${url}/api/${path}/admin/product/${this.tempProduct.id}`; //抓取當前的產品資料id
        method = "put";
      }
      axios[method](upUrl, { data: this.tempProduct }) //上傳 tempProduct內的資料,上傳的位置是在物件data之下
        .then(() => {
          this.getProducts(); //新增資料後，更新頁面
          productModal.hide(); //新增資料後，關閉modal視窗
        })
        .catch((err) => {
          alert(err.data.message);
        });
    },
    deleteProduct() {
      axios
        .delete(`${url}/api/${path}/admin/product/${this.tempProduct.id}`) //有分頁位置,productAll（沒有分頁)
        .then(() => {
          this.getProducts(); //刪除資料後，更新頁面
          deleteProductModal.hide(); //刪除資料後，關閉modal視窗
        })
        .catch((err) => {
          alert(err.data.message);
        });
    },
    addImage() {
      this.tempProduct.imagesUrl = []; //將原來的圖片陣列清空
      this.tempProduct.imagesUrl.push(""); //加入一筆資料
    },
    openModal(status, product) {
      //帶入參數代稱為status, 當前資料為product
      if (status === "new") {
        productModal.show(); //打開彈出視窗
        this.isNew = true; //將狀態改成新增 true
        this.tempProduct = {
          //tempProduct暫存檔案資料為初始值
          imagesUrl: [],
        };
      } else if (status === "edit") {
        productModal.show(); //打開彈出視窗
        this.isNew = false; //將狀態改成編輯 false
        this.tempProduct = { ...product }; //tempProduct暫存檔案資料為prodcut的值(也就是當前頁面操作所輸入的資料),同時要使用...做展開
      } else if (status === "delete") {
        deleteProductModal.show(); //打開彈出視窗(刪除)
        this.tempProduct = { ...product }; //取得當前的物件ID、可以給刪除做使用
      }
    },
    checkLogin() {
      axios
        .post(`${url}/api/user/check`)
        .then((res) => {
          //登入成功就顯示資料
          this.getProducts();
        })
        .catch((err) => {
          alert(err.data.message);
          location.href = "login.html"; //未登入或是嘗試直接進入此頁會回到login頁
        });
    },
    productDetail(item) {
      //帶入product的item參數
      //點擊時將物件item資訊淺拷貝放入到temp內
      this.tempProduct = { ...item };
    },
    initialProduct(){
      this.tempProduct.data = {};
      this.isNew = false;
    }//初始化
  },
  components: {
    pagination,
    productModalTemp,
    deleteProductModalTemp
  },
  mounted() {
    const token = document.cookie.replace(
      /(?:(?:^|.*;\s*)richToken\s*=\s*([^;]*).*$)|^.*$/,
      "$1"
    );
    axios.defaults.headers.common["Authorization"] = token;
    //執行登入確認
    this.checkLogin();
    productModal = new bootstrap.Modal("#productModal"); //定義 Boostrap 新增、編輯產品彈出視窗
    deleteProductModal = new bootstrap.Modal("#delProductModal"); //定義 Boostrap 刪除產品彈出視窗
  },
});
app.component("product-modal", {
  props: ["tempProduct", "updateProduct"],
  template: "#product-modal-template",
});//  X-template元件使用
app.mount("#app");
