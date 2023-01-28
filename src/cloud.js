const cloudinary = require('cloudinary')

cloudinary.config({
    cloud_name:"sannu",
    api_key:"424361894432361",
    api_secret:'kHYA1ePEpyh4HWYsjakhTu5r044'
})

exports.uploads = (file, folder) =>{
    return new Promise(resolve=>{
        cloudinary.uploader.upload(file,(result)=>{
            resolve({
                url:result.url})
    },{
        resourse_type:'auto',
        folder:folder
    })
    })

}