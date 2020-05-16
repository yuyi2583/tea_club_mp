import { configure, observable, action } from 'mobx-miniprogram'
import {url} from "../utils/url.js";

// 不允许在动作外部修改状态
configure({ enforceActions: 'observed' });

export const app = observable({

  // 数据字段
  retrieveRequestQuantity: 0,
  updateRequestQuantity: 0,
  swiperList:[],

  // actions
  startRetrieveRequest: action(function () {
   this.retrieveRequestQuantity+=1;
  }),
  startUpdateRequest:action(function(){
    this.updateRequestQuantity+=1;
  }),
  finishRetrieveRequest:action(function(){
    this.retrieveRequestQuantity-=1;
  }),
  finishUpdateRequest:action(function(){
    this.updateRequestQuantity-=1;
  }),
  fetchSwiperList:action(function(){
    this.startRetrieveRequest();
    const thiz=this;
    wx.request({
      url: url.swiper(),
      header: {
        'content-type': 'application/json' // 默认值
      },
      success(res) {
        thiz.handleSwiperList(res.data.data);
      },
      complete(){
        thiz.finishRetrieveRequest();
      }
    })
  }),
  //处理获取后台返回的走马灯数据
  handleSwiperList: action(function (data) {
    let swiperList = new Array();
    data.forEach(item => {
      const url = `data:image/jpeg;base64,${item.photo}`;
      let type = "";
      for (var key in item) {
        if (key != "photo" && item[key] != 0) {
          type = key.substring(0, key.length - 2);
        }
      }
      swiperList.push({ uid: item.uid, type, url });
    });
    this.swiperList=swiperList;
  }),

})
