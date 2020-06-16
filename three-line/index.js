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
    // this.chart = Chart.init(this.container[0]);
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
    let cfg = this.mergeConfig(config);
    // curCfg = cfg;
    // if (this.chart) {
    //   this.chart.clear();
    //   this.container.empty();
    // }
    // let chartDom;
    // let domList = [];
    // for (let i = 0; i < 3; i++) {
    //   const curDom = document.createElement('div');
    //   if (i < 2) {
    //     curDom.classList.add('item');
    //     curDom.classList.add(`item-${i + 1}`);
    //     curDom.style.background = `url(${cfg.dot1}) no-repeat  0 6px `;
    //     if (i === 0) {
    //       curDom.innerText = '用电类别';
    //       curDom.style.background = `url(${cfg.dot2}) no-repeat  0 6px `;
    //     } else {
    //       curDom.innerText = '行业分类';
    //     }
    //     domList.push(curDom);
    //   } else {
    //     curDom.classList.add('chart');
    //     chartDom = curDom;
    //   }
    //   this.container[0].appendChild(curDom);
    // }
    // this.chart = Chart.init(chartDom); 
    this.chart.setOption(this.optionData(data, cfg));
    // let domList = document.querySelectorAll('.item');
    // for (let i = 0; i < domList.length; i++) {
    //   let that = this;
    //   domList[i].onclick = function() {
    //     for (let i = 0; i < domList.length; i++) {
    //       domList[i].style.background = `url(${cfg.dot1}) no-repeat  0 6px `;
    //     }
    //     domList[i].style.background = `url(${cfg.dot2}) no-repeat  0 6px `;
    //     i === 0 ? that.chart.setOption(that.optionData(data.data1, curCfg)) : that.chart.setOption(that.optionData(data.data2, curCfg));
    //   }
    // }
    //更新图表
    //this.chart.render(data, cfg);
    // this.container.html(data[0].value)
    //如果有需要的话,更新样式
    this.updateStyle();
  },
  optionData(data, config) {
    const xAxisData = [];
    const yAxisData1 = [];
    const yAxisData2 = [];
    const yAxisData3 = [];
    data.forEach(item => {
      let curStr = '';
      if (item.name.length <= 4) {
        curStr = item.name;
      }
      if (item.name.length > 4) {
        curStr = `${item.name.slice(0, 4)}\n${item.name.slice(4)}`;
      }
      if (item.name.length > 8) {
        curStr = `${item.name.slice(0, 4)}\n${item.name.slice(4, 8)}\n${item.name.slice(8)}`;
      }
      xAxisData.push(curStr);
      yAxisData1.push(item.value1);
      yAxisData2.push(item.value2);
      yAxisData3.push(item.value3);
    });
    return {
      grid: {
        left: config.grid.left,
        right: config.grid.right,
        top: config.grid.top,
        bottom: config.grid.bottom,
        containLabel: true
      },
      tooltip: {
        show: true,
        trigger: 'axis',
        axisPointer: {
          type: 'line',
          lineStyle: {
            type: 'solid',
            width: 2,
            color: '#fff'
          }
        },
        formatter: function(params) {
          let res = params[0].name;
          res += `<br />${params[0].seriesName} : ${params[0].value}亿元<br>${params[1].seriesName} : ${params[1].value}亿元<br>${params[2].seriesName} : ${params[2].value}亿元`;
          return res;
        },
        textStyle: {
          color: '#fff',
          fontSize: 20,
          fontWeight: 'bold'
        }
      },
      xAxis: [{
        type: 'category',
        boundaryGap: false,
        axisLabel: {
          interval:0,  
          rotate: 45,  
          color: config.xAxis.axisLabel.textStyle.color,
          fontSize: config.xAxis.axisLabel.textStyle.fontSize,
          fontWeight: config.xAxis.axisLabel.textStyle.fontWeight,
          margin: config.xAxis.axisLabel.margin
        },
        axisLine: {
          show: false,
          lineStyle: {
            color: '#0072ff',
            width: config.xAxis.axisLine.lineStyle.width
          }
        },
        axisTick: {
          show: false,
        },
        splitLine: {
          show: false
        },
        data: xAxisData
      }],
      yAxis: [
        {
          type: 'value',
          name: '亿元',
          nameTextStyle: {
            color: config.yAxis.nameTextStyle.color,
            fontSize: config.yAxis.nameTextStyle.fontSize,
            fontWeight: config.yAxis.nameTextStyle.fontWeight,
          },
          axisLabel: {
            formatter: '{value}',
            textStyle: {
              color: config.yAxis.axisLabel.textStyle.color,
              fontSize: config.yAxis.axisLabel.textStyle.fontSize,
              fontWeight: config.yAxis.axisLabel.textStyle.fontWeight,
            },
            margin: config.yAxis.axisLabel.margin
          },
          axisLine: {
            show: false,
            lineStyle: {
              color: '#0072ff',
              width: config.yAxis.axisLine.lineStyle.width
            }
          },
          axisTick: {
            show: false,
          },
          splitLine: {
            show: true,
            lineStyle: {
              color: '#103062',
              width: 1.5
            }
          }
        }
      ],
      series: [
        {
          name: '力率电费',
          type: 'line',
          stack: '总量',
          symbol: 'circle',
          symbolSize: 10,
          itemStyle: {
            normal: {
              color: '#fdd100',
              lineStyle: {
                color: "#fdd100",
                width: 2.5
              },
              areaStyle: {
                //color: '#94C9EC'
                color: new Chart.graphic.LinearGradient(0, 1, 0, 0, [{
                  offset: 0,
                  color: 'rgba(255, 255, 255, 0)'
                }, {
                  offset: 1,
                  color: 'rgba(253, 209, 0, 0.5)'
                }]),
              }
            }
          },
          data: yAxisData1
        },
        {
          name: '基本电费',
          type: 'line',
          stack: '总量',
          symbol: 'circle',
          symbolSize: 10,
          itemStyle: {
            normal: {
              color: '#24f1ff',
              lineStyle: {
                color: "#24f1ff",
                width: 2.5
              },
              areaStyle: {
                //color: '#94C9EC'
                color: new Chart.graphic.LinearGradient(0, 1, 0, 0, [{
                  offset: 0,
                  color: 'rgba(255, 255, 255, 0)'
                }, {
                  offset: 1,
                  color: 'rgba(36, 241, 255, 0.5)'
                }]),
              }
            }
          },
          markPoint: {
            itemStyle: {
              normal: {
                color: 'red'
              }
            }
          },
          data: yAxisData2
        },
        {
          name: '电度费用',
          type: 'line',
          stack: '总量',
          symbol: 'circle',
          symbolSize: 8,
          itemStyle: {
            normal: {
              color: '#51e0ce',
              lineStyle: {
                color: "#51e0ce",
                width: 2.5
              },
              areaStyle: {
                //color: '#94C9EC'
                color: new Chart.graphic.LinearGradient(0, 1, 0, 0, [{
                  offset: 0,
                  color: 'rgba(255, 255, 255, 0)'
                }, {
                  offset: 1,
                  color: 'rgba(81, 224, 206, 0.5)'
                }]),
              }
            }
          },
          data: yAxisData3
        }
      ]
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
   destroy: function(){console.log('请实现 destroy 方法')}
});