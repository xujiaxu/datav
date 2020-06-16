var Event = require('bcore/event');
var $ = require('jquery');
var _ = require('lodash');
var Chart = require('echarts');
import './index.less';
let curCfg = null;
/**
 * 马良基础类
 */
module.exports = Event.extend(function Base(container, config) {
  this.config = {
    theme: {}
  }
  this.container = $(container);           //容器
  this.apis = config.apis;                 //hook一定要有
  this._data = null;                       //数据
  this.chart = null;                       //图表
  this.init(config);
}, {
  /**
   * 公有初始化
   */
  init: function (config) {
    //1.初始化,合并配置
    this.mergeConfig(config);
    //2.刷新布局,针对有子组件的组件 可有可无
    this.updateLayout();
    //3.子组件实例化
    this.chart = Chart.init(this.container[0]);
    //4.如果有需要, 更新样式
    this.updateStyle();
  },
  /**
   * 绘制
   * @param data
   * @param options 不一定有
   * !!注意: 第二个参数支持config, 就不需要updateOptions这个方法了
   */
  render: function (data, config) {
    data = this.data(data);
    var cfg = this.mergeConfig(config);
    curCfg = cfg;
    if (this.chart) {
      this.chart.clear();
      this.container.empty();
    }
    let chartDom;
    let domList = [];
    for (let i = 0; i < 3; i++) {
      const curDom = document.createElement('div');
      if (i < 2) {
        curDom.classList.add('item-rose');
        curDom.classList.add(`item-rose-${i + 1}`);
        curDom.style.background = `url(${cfg.dot1}) no-repeat  0 6px `;
        if (i === 0) {
          curDom.innerText = '用电类别';
          curDom.style.background = `url(${cfg.dot2}) no-repeat  0 6px `;
        } else {
          curDom.innerText = '行业分类';
        }
        domList.push(curDom);
      } else {
        curDom.classList.add('chart-rose');
        chartDom = curDom;
      }
      this.container[0].appendChild(curDom);
    }
    this.chart = Chart.init(chartDom); 
    this.chart.setOption(this.optionData(data.data1, cfg));
    // let domList = document.querySelectorAll('.item-rose');
    for (let i = 0; i < domList.length; i++) {
      let that = this;
      domList[i].onclick = function() {
        for (let i = 0; i < domList.length; i++) {
          domList[i].style.background = `url(${cfg.dot1}) no-repeat  0 6px `;
        }
        domList[i].style.background = `url(${cfg.dot2}) no-repeat  0 6px `;
        i === 0 ? that.chart.setOption(that.optionData(data.data1, curCfg)) : that.chart.setOption(that.optionData(data.data2, curCfg));
      }
    }
    //更新图表
    // this.chart.render(data, cfg);
    // this.container.html(data[0].value)
    //如果有需要的话,更新样式
    this.updateStyle();
  },
  optionData(data, config) {
    let total = 0;
    let nameAry = [];
    data.forEach(item => {
      total += item.value;
      nameAry.push(item.name);
    });
    return {
      legend: {
        show: true,
        bottom: 0,
        orient: 'vertical', 
        right: config.legend.right,
        icon: 'stack',
        itemWidth: 30,
        itemHeight: 15,
        itemGap: 5,
        textStyle: {
          color: config.legend.textStyle.color,
          fontSize: config.legend.textStyle.fontSize,
          fontWeight: 'bold'
        },
        data: nameAry
      },
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c}千瓦时 <br />占比: {d}%',
        textStyle: {
          fontSize: 28,
          fontWeight: 'bold',
          color: '#8ee6ff'
        }
      },
      series: [{
        type: 'pie',
        hoverOffset: 5,
        radius: config.series.radius,
        center: ['35%', '50%'],
        color: ['#0BCFB5', '#FED100', '#499332', '#00AFFF', '#5E48FF', '#FF48F0', '#FF4873', '#fff77f'],
        data: data,
        roseType: 'radius',
        labelLine: {
          normal: {
            show: false,
            length: 20,
            length2: 20,
            lineStyle: {
              color: '#8ee6ff',
              width: 2
            }
          }
        },
        label: {
          show: false,
          distanceToLabelLine: 10,
          formatter: '{c|{c}}{b|千瓦时}\n{hr|}\n{d|{d}}{a|%}',
          rich: {
            a: {
              fontSize: config.series.label.rich.a.fontSize,
              fontWeight: config.series.label.rich.a.fontWeight,
              color: config.series.label.rich.a.color,
              align: 'left',
              padding: config.series.label.rich.a.padding
            },
            b: {
              fontSize: config.series.label.rich.b.fontSize,
              fontWeight: config.series.label.rich.b.fontWeight,
              color: config.series.label.rich.b.color,
              align: 'left',
              padding: config.series.label.rich.b.padding
            },
            hr: {
              borderColor: '#8ee6ff',
              width: '100%',
              borderWidth: 2,
              height: 0
            },
            d: {
              fontSize: config.series.label.rich.d.fontSize,
              fontWeight: config.series.label.rich.d.fontWeight,
              color: config.series.label.rich.d.color,
              padding: config.series.label.rich.d.padding,
              align: 'right'
            },
            c: {
              fontSize: config.series.label.rich.c.fontSize,
              fontWeight: config.series.label.rich.c.fontWeight,
              color: config.series.label.rich.c.color,
              padding: config.series.label.rich.c.padding,
              align: 'right'
            }
          }
        }
      }]
    };
  },
  /**
   *
   * @param width
   * @param height
   */
  resize: function (width, height) {
    this.updateLayout(width, height);
    //更新图表
    this.chart.resize({
     width: width,
     height: height
    })
  },
  /**
   * 每个组件根据自身需要,从主题中获取颜色 覆盖到自身配置的颜色中.
   * 暂时可以不填内容
   */
  setColors: function () {
    //比如
    //var cfg = this.config;
    //cfg.color = cfg.theme.series[0] || cfg.color;
  },
  /**
   * 数据,设置和获取数据
   * @param data
   * @returns {*|number}
   */
  data: function (data) {
    if (data) {
      this._data = data;
    }
    return this._data;
  },
  /**
   * 更新配置
   * 优先级: config.colors > config.theme > this.config.theme > this.config.colors
   * [注] 有数组的配置一定要替换
   * @param config
   * @private
   */
  mergeConfig: function (config) {
    if (!config) {return this.config}
    this.config.theme = _.defaultsDeep(config.theme || {}, this.config.theme);
    this.setColors();
    this.config = _.defaultsDeep(config || {}, this.config);
    return this.config;
  },
  /**
   * 更新布局
   * 可有可无
   */
  updateLayout: function () {},
  /**
   * 更新样式
   * 有些子组件控制不到的,但是需要控制改变的,在这里实现
   */
  updateStyle: function () {
    var cfg = this.config;
    this.container.css({
      'font-size': cfg.size + 'px',
      'color': cfg.color || '#fff'
    });
  },
  /**
   * 更新配置
   * !!注意:如果render支持第二个参数options, 那updateOptions不是必须的
   */
  //updateOptions: function (options) {},
  /**
   * 更新某些配置
   * 给可以增量更新配置的组件用
   */
  //updateXXX: function () {},
  /**
   * 销毁组件
   */
  clear: function () {
    this.chart && this.chart.clear && this.chart.clear();
  },
  destroy: function(){
    this.chart && this.chart.dispose && this.chart.dispose();
   }
});