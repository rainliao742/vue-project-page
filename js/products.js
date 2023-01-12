//const { default: axios } = require("axios");

const url = "https://vue3-course-api.hexschool.io/v2"; //公用加入點
const path = 'richliao' //個人path

const App = {
  data() {
    return {
      products: [], // 擺放遠端的資料用
      temp: {}, //暫存資料區,當下選取的物件資料用
    };
  },
  methods:{
    getProducts(){//取的遠端產品資料
      axios.get(`${url}/api/${path}/admin/products`)
      .then((res)=>{
        this.products = [...res.data.products]; //讀取遠端data裡的products,並且淺拷貝,放入空陣列products
      })
      .catch((err)=>{
       alert(err.data.message);
      })
    },
    checkLogin(){
      axios.post(`${url}/api/user/check`)
        .then((res) => {
          //登入成功就顯示資料
          this.getProducts();
        })
        .catch((err) => {
          alert(err.data.message);
          location.href = "login.html"; //未登入或是嘗試直接進入此頁會回到login頁
        });
    },
    productDetail(item){//帶入product的item參數
      //點擊時將物件item資訊淺拷貝放入到temp內
      this.temp = {...item}
    }
  },
  mounted(){
    const token = document.cookie.replace(
      /(?:(?:^|.*;\s*)richToken\s*=\s*([^;]*).*$)|^.*$/,
      "$1"
    );
    axios.defaults.headers.common['Authorization'] = token;
    //執行登入確認
    this.checkLogin();
  }
};
Vue.createApp(App).mount("#app");
