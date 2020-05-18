// pages/product/productDetail/index.js
import { createStoreBindings } from 'mobx-miniprogram-bindings';
import { product } from "../../../mobx/product.js";

const app=getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    StatusBar: app.globalData.StatusBar,
    CustomBar: app.globalData.CustomBar,
    Custom: app.globalData.Custom,
    ColorList: app.globalData.ColorList
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      productId: options.uid
    });
    this.storeBindings = createStoreBindings(this, {
      store: product,
      fields: ['byProductPhotos', 'byProducts'],
      actions: ['fetchProduct'],
    });

    this.fetchProduct(options.uid);

  },

  showModal:function(e){
    this.setData({
      modalName: e.currentTarget.dataset.target
    })
  },

  hideModal: function (e) {
    this.setData({
      modalName:"",
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    this.storeBindings.destroyStoreBindings();
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    const { productId, byProducts}=this.data;
    return {
      title: byProducts[productId].name,
      desc: byProducts[productId].description,
      path: `/page/product/productDetail?uid=${productId}` // 路径，传递参数到指定页面。

    }
  }
})