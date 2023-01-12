//const { default: axios } = require("axios");

const url = "https://vue3-course-api.hexschool.io/v2"; //公用加入點
const path = 'richliao' //個人path

const { createApp } = Vue;
const App = {
  data() {
    return {
      products: [], // 擺放遠端的資料用
      temp: {}, //暫存資料區,當下選取的物件資料用
      user: {
        //登入資訊
        username: "",
        password: "",
      },
    };
  },
  methods:{
    
    login(){//登入資訊
      axios.post(`${url}/admin/signin`, this.user)
      .then((res)=>{
        const { token, expired } = res.data; // 取出遠端 cookiem,token, 登入檔案
        document.cookie = `richToken=${token}; expires=${new Date(expired)};`;  //hexToken 必須跟 product 頁面一樣設定名稱
        location.href='products.html'
        alert(res.data.message);
      })
      .catch((err)=>{
        alert(err.data.message);
      })
    },
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
          location.href = "login.html"; //未登入或是嘗試直接進入此頁面會被導入login頁
        });
    },
    productDetail(item){//帶入item參數
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
createApp(App).mount("#app");
