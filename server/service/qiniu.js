import qiniu from 'qiniu';

async function getSign(req) {
    var accessKey = 'I2KB6uFiqnEo4U7keEV6g8GB18BTQXglbKDdYMW4';
    var secretKey = 'LpP722bHyjQsV3reu8ReTmcOPYwpSACBD0XfOt5t';
    var mac = new qiniu.auth.digest.Mac(accessKey, secretKey);
    var options = {
        scope: 'limbo-daydaymoment',
      };
      var putPolicy = new qiniu.rs.PutPolicy(options);
      var uploadToken = putPolicy.uploadToken(mac);
      return {
        token: uploadToken
      };
}


export {getSign}
