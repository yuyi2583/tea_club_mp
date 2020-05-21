// pages/order/orderPreview/index.js
import { createStoreBindings } from 'mobx-miniprogram-bindings';
import { product } from "../../../mobx/product.js";
import { user } from "../../../mobx/user.js";
import { shop } from "../../../mobx/shop.js";

Page({

  /**
   * 页面的初始数据
   */
  data: {
    ps:"",
    showModal: false,
    ruleId:null,
    ingot:0,
    credit:0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const { productId, number } = options;
    console.log("options", productId.split(","))
    this.setData({
      productId: options.productId.split(","),
      number: options.number.split(","),
      deliveryMode:options.deliveryMode,
      shopId:options.shopId
    }); 
    // this.setData({
    //   productId: 1,
    //   number: 1,
    //   deliveryMode: 'selfPick',
    //   shopId: 26
    // });
    this.storeBindings = createStoreBindings(this, {
      store: product,
      fields: ['byProductPhotos','byProducts','byActivityRules'],
      actions: ['fetchProduct'],
    });
    this.storeBindings = createStoreBindings(this, {
      store: user,
      fields: ['userInfo'],
    });
    this.storeBindings = createStoreBindings(this, {
      store: shop,
      fields: ['byShops'],
    });

    
  },
  psInput:function(e){
    this.setData({
      ps: e.detail.value
    })
  },

  //数量改变事件
  numberChange:function(e){
    const { detail } = e;
    const { number,option } = detail;
    let dataNumber=this.data.number;
    dataNumber[option]=number;
    this.setData({
      number: dataNumber
    });
    this.calculateAmount();
  },
  hideModal: function (e) {
    this.setData({
      showModal: false,
      ruleId:null
    })
  },
  showActivity:function(e){
    this.setData({
      ruleId: e.currentTarget.dataset.target,
      showModal:true
    })
  },
  calculateAmount:function() {
    const { productId, userInfo, byProducts, byActivityRules, number}=this.data
    var activityBitmap = new Object(); //用于记录已参与的活动
    var customerType = userInfo.customerType;
    var ingot = 0;
    var credit = 0;
    productId.forEach(function (key, index) {
      //遍历该产品所参与的活动，产品所参与的活动已按照优先级降序排序
      //即产品优先参与优先级高的活动，每个产品一次只能参与一个活动
      //积分不参与折扣
      const rule = byProducts[key].activityRules;
      var isOneOfRuleApplicable = false;
      for (var i = 0; i < rule.length; i++) {
        const activityId = byActivityRules[rule[i]].activity.uid;
        const activityApplyForCustomerTypes = byActivityRules[rule[i]].activityApplyForCustomerTypes;
        //判断用户的vip等级能否参与此活动
        var isApplicable = false;
        activityApplyForCustomerTypes.forEach(function (type) {
          if (type.uid == customerType.uid) {
            isApplicable = true;
          }
        });
        //vip等级不够则继续判断该产品下一个参与的活动
        if (!isApplicable) {
          continue;
        }
        //判断是否与已有活动互斥
        var isMutex = false;
        for (var activityKey in activityBitmap) {
          if (byActivityRules[rule[i]].activity.mutexActivities.filter(function (item) { return item.uid == activityKey }).length > 0) {
            isMutex = true;
          }
        }
        //互斥则继续判断该产品下一个参与的活动
        if (isMutex) {
          continue;
        }
        //否则将其记录在bitmap中并结束遍历
        isOneOfRuleApplicable = true;
        if (!activityBitmap[activityId] || !activityBitmap[activityId][rule[i]]) {
          activityBitmap[activityId] = new Object();
          activityBitmap[activityId][rule[i]] = new Array();

        }
        for (var j = 0; j < number[index]; j++) {
          activityBitmap[activityId][rule[i]].push(key);
        }
        break;
      }
      //若这个产品的所有优惠规则不适用
      //即不参加活动
      if (!isOneOfRuleApplicable) {
        ingot += byProducts[key].price.ingot * number[index];
        credit += byProducts[key].price.credit * number[index];
      }
    })
    //计算总价
    console.log("activityBitmap", activityBitmap);
    for (var activityId in activityBitmap) {
      for (var ruleId in activityBitmap[activityId]) {
        const activityRule1 = byActivityRules[ruleId].activityRule1;
        const activityRule2 = byActivityRules[ruleId].activityRule2;
        let ruleIngot = 0;
        let ruleCredit = 0;
        activityBitmap[activityId][ruleId].forEach(function (productId) {
          ruleIngot += byProducts[productId].price.ingot;
          ruleCredit += byProducts[productId].price.credit;
        });
        if (activityRule2 == null) {
          //折扣
          ingot += ruleIngot * (100 - activityRule1) / 100;
          credit += ruleCredit;
        } else {
          //购物满xx赠/减xx积分/元宝
          if (ruleIngot > activityRule1) {//满足条件
            if (activityRule2.operation == "minus") {//满减元宝,满赠在后台处理
              // if (activityRule2.currency == "ingot") {
              ruleIngot -= activityRule2.number;
              // } else {
              //     ruleCredit -= activityRule2.number;
              // }
            }
          }
          ingot += ruleIngot;
          credit += ruleCredit;
        }
      }
    }
    console.log("ingot",ingot,'credit',credit);
    this.setData( {
      ingot,
      credit
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    this.calculateAmount();
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

  }
})