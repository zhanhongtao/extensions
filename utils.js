// @NOTE:
// 不支持 a, beta 等版本.
// 版本号长度最多为 4 个.
// 主版本, 次版本, 修正版本, build 版本.
// update 函数只更新 build 版本号.
exports.updateBuildVersion = function(version) {
  var versions, defaultVersion = '0';
  version = String(version).trim();
  version = /[^\.\d]/.test(version) ? defaultVersion : version;
  versions = version.split('.');
  while (versions.length < 4) versions.push(0);
  versions.length = 4;
  versions[3] = parseInt(versions[3], 10) + 1;
  return versions.join('.');
};

exports.mixin = function mixin(des, src, map){
  if(typeof des !== 'object' 
    && typeof des !== 'function'){
    throw new TypeError('Unable to enumerate properties of '+ des);
  }
  if(typeof src !== 'object' 
    && typeof src !== 'function'){
    throw new TypeError('Unable to enumerate properties of '+ src);
  }

  map = map || function(d, s, i, des, src){
    //这里要加一个des[i]，是因为要照顾一些不可枚举的属性
    if(!(des[i] || (i in des))){
      return s;
    }
    return d;
  }

  if(map === true){ //override
    map = function(d,s){
      return s;
    }
  }

  for (var i in src) {
    des[i] = map(des[i], src[i], i, des, src);
    //如果返回undefined，尝试删掉这个属性
    if(des[i] === undefined) delete des[i]; 
  }
  return des;       
};

