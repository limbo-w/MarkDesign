<style>
@font-face{
    font-family: 'font23001';
    src : url('/template/font/SourceHanSerifCN-Heavy-4.otf');
}
/** 思源黑体 - Heavy */
@font-face{
    font-family: 'font23002';
    src : url('/template/font/2023020201.otf');
}
/** 思源宋体SC - Heavy */
@font-face{
    font-family: 'fnsystSCHeavy';
    src : url('/template/font/fnsystSCHeavy.woff');
}
/** 字魂167-伊人黑 */
@font-face{
    font-family: 'zh167yrh';
    src : url('/template/font/zh167yrh.woff');
}
/** 字魂53号-云霄体 */
@font-face{
    font-family: 'zh53hyxt';
    src : url('/template/font/zh53hyxt.woff');
}
:focus{outline:none;}
.board-view {
    background-color: #fafafa;
    padding: 30px 0px;

}
.konvajs-content {
    margin: 0px auto;
    background-color: white;
    box-shadow: rgb(0 0 0 / 20%) 1px 1px 15px;
}
</style>

<template>
    <div class="w-full h-full">
        <EditorViewBar/>
        <div class="board-view" style="height: calc(100% - 43px);">
            <div id="editorContainer"></div>
        </div>
        <canvas id="downloadCanvas" style="display:none;"></canvas>
    </div>
</template>

<script setup lang="ts">
import {
  ElMessage,
} from "element-plus";

import eventBus from '~/assets/js/lib/eventBus'

let stage = null
let layer = null
let tr = null
let activeNode = null
let activeCropRect = null
let transformerRect = null
let transformerContainer = null

const member = useState("member")

// VIP
const memberVerify = () => {
    return member.value && member.value.verify
}
const addWaterMark = () => {
    var simpleText = new Konva.Text({
        x: (stage.width() / 2) - 35,
        y: stage.width() / 2 + 60,
        text: 'daydaymoment',
        fontSize: 12,
        fill: 'gray',
        rotation: 45,
        opacity: 0.4
    });
    layer.add(simpleText)
    simpleText.zIndex(99999)
}

// 初始化画布
const initStage = (json) => {
    // 反序列化对象并显示在画布上
    stage = Konva.Node.create(json, 'editorContainer');

    layer = stage.getLayers()[0]

    // 添加变换对象
    tr = new Konva.Transformer();
    layer.add(tr);

    // 找到图片并加载显示
    stage.find('Image').forEach(node => {
        const url = node.getAttr('imageSource')
        var imageObj = new Image();
        imageObj.crossOrigin = 'Anonymous';
        imageObj.onload = function () {
            node.image(imageObj);
        };
        imageObj.src = url;
    });


    // 图片绑定 click 事件
    stage.find('Image').forEach((node) => {
        console.log("Image::", node)
        node.on('click', function (e) {
            activeNode = node
            tr.nodes([node]);
            emitToBar('image', node.toJSON())
            e.evt.preventDefault();
        });
    })

    // 文本绑定 click、dblclick 事件
    stage.find('Text').forEach((node) => {
        node.on('dblclick', function (e) {
            // textNodeEdit(node)
            e.evt.preventDefault();
        });
        node.on('click', function (e) {
            activeNode = node
            tr.nodes([node]);
            emitToBar('text', node.toJSON())
            e.evt.preventDefault();
        });
    })

    if (!memberVerify()) {
        addWaterMark()
    }
}


const onEditBarAction = (params:any) => {
    if (params.type == "clone") { // 复制节点
        const active = params.value
        var clone = activeNode.clone();
        if (active == 'image') {
            clone.on('click', function (e) {
                activeNode = clone
                tr.nodes([clone]);
                emitToBar('image', clone.toJSON())
                e.evt.preventDefault();
            });
            tr.nodes([clone]);
            layer.add(clone)
        }
    } else if (params.type == "zindex") {
        let value = params.value
        if (value == 'top') {
            activeNode.moveToTop()
        } else if (value == 'bottom') {
            activeNode.moveToBottom()
        } else if (value == 'up') {
            activeNode.moveUp()
        } else if (value == 'down') {
            activeNode.moveDown()
        }
    } else if (params.type == "font") {
        activeNode.fontFamily(params.value)
    } else if (params.type == "fontSize") {
        activeNode.fontSize(params.value)
    } else if (params.type == "stroke") {
        activeNode.stroke(params.value)
    } else if (params.type == "fill") {
        activeNode.fill(params.value)
    } else if (params.type == "fillPatternImage") { // 背景
        var imageObj = new Image();
        imageObj.crossOrigin = 'Anonymous';
        imageObj.onload = function() {
            activeNode.fillPatternImage(imageObj);
        };
        imageObj.src = params.value
    } else if (params.type == "fillLinearGradientColorStops") { // 渐变
        activeNode.fillPatternImage(params.value)
    } else if (params.type == "image") {
        // 图片充满
        if (params.key == 'fit') {
            activeNode.setAttrs({
                x: 0,
                y: 0,
                width: stage.width(),
                height: stage.height(),
                scaleX: 1,
                scaleY: 1
            });
        } else if (params.key == 'crop') { // 图片裁剪
            let activeX = activeNode.x()
            let activeY = activeNode.y()
            let activeWidth = activeNode.width()
            let activeheight = activeNode.height()
            // 初始化一个矩形框
            activeCropRect = new Konva.Rect({
                x: activeX + 20,
                y: activeY + 20,
                width: Math.min(100, activeWidth),
                height: Math.min(100, activeheight),
                stroke: '',
                strokeWidth: 2,
                draggable: true,
            });
            transformerRect = activeCropRect

            // 初始化 transformer 对象
            var trCrop = new Konva.Transformer({
                node: activeCropRect,
                enabledAnchors: ['top-left', 'top-center', 'top-right', 'middle-right', 'middle-left', 'bottom-left', 'bottom-center', 'bottom-right'],
                // set minimum width of text
                // boundBoxFunc: function (oldBox, newBox) {
                //     newBox.width = Math.max(30, newBox.width);
                //     return newBox;
                // },
            });
            transformerContainer = trCrop // 放到全局变量，方便后面操作
            layer.add(activeCropRect)  // 添加矩形框到 Layer
            layer.add(trCrop) // 添加 transformer 框到 Layer


            // 移动裁剪框，判断移动范围
            activeCropRect.on('dragmove', () => {
                // stage 的缩放比例
                // let stageScaleX = stage.scaleX()
                // let stageScaleY = stage.scaleY()

                // 矩形框 的位置和宽高
                let activeCropRectX = activeCropRect.x()
                let activeCropRectY = activeCropRect.y()
                let cropWidth = activeCropRect.width()
                // cropWidth = cropWidth*stageScaleX
                let cropHeight = activeCropRect.height()

                // 要裁剪对象的坐标和宽高
                let activeX = activeNode.x()
                let activeY = activeNode.y()
                let activeWidth = activeNode.width()
                // activeWidth = activeWidth*stageScaleX
                let activeHeight = activeNode.height()


                // 拖动不允许超出裁剪对象范围
                if (activeCropRectX < activeX) {
                    activeCropRect.x(activeX)
                }
                if ((activeCropRectX + cropWidth) > (activeX + activeWidth)) {
                    let fix = activeX + activeWidth - cropWidth
                    activeCropRect.x(fix)
                }
                if (activeCropRectY < activeY) {
                    activeCropRect.y(activeY)
                }
                if ((activeCropRectY + cropHeight) > (activeY + activeHeight)) {
                    let fix = activeY + activeHeight - cropHeight
                    activeCropRect.y(fix)
                }
            });
        } else if (params.key == 'cropDone') { // 确认裁剪结束
            // 裁剪的对象
            let imageSource = activeNode.getAttr('imageSource')
            var imageObj = new Image();
            imageObj.crossOrigin = 'Anonymous';
            imageObj.onload = function () {
                // 裁剪对象的宽高
                let imgWid = this.width
                let imgHei = this.height

                // 裁剪矩形的坐标
                let pos = activeCropRect.absolutePosition()
                let cropRectX = pos.x
                let cropRectY = pos.y
                let cropWidth = activeCropRect.getClientRect().width
                let cropHeight = activeCropRect.getClientRect().height

                // 裁剪对象的坐标
                let posActive = activeNode.absolutePosition()
                let nodeX = posActive.x
                let nodeY = posActive.y


                let stageScaleX = stage.scaleX() // stage的 x 缩放
                let stageScaleY = stage.scaleY() // stage的 y 缩放

                // 裁剪对象相对stage的缩放值
                let scaleX = imgWid/(activeNode.width()*stageScaleX)
                let scaleY = imgHei/(activeNode.height()*stageScaleY)

                // 裁剪对象相对选中状态时显示的缩放值
                let scaleX2 = imgWid/(activeNode.width())
                let scaleY2 = imgHei/(activeNode.height())


                // 裁剪矩形的坐标和裁剪对象的坐标距离差
                let diffX= cropRectX - nodeX
                let diffY= cropRectY - nodeY

                // 裁剪对象开始裁剪，按坐标和宽高进行裁剪
                activeNode.crop({x: diffX*scaleX, y: diffY*scaleY, width: cropWidth*scaleX2/stageScaleX, height: cropHeight*scaleY2/stageScaleY})
                // 设定裁剪对象裁剪后的坐标
                activeNode.absolutePosition({x: cropRectX, y: cropRectY})
                // 裁剪对象的宽高按Stage大小比例进行实际的显示
                activeNode.width(cropWidth/stageScaleX)
                activeNode.height(cropHeight/stageScaleY)

                // 取消 变换矩形 和 transformer 的显示和绑定
                transformerContainer && transformerContainer.detach()
                transformerRect && transformerRect.destroy()
            };
            imageObj.src = imageSource;
        } else if (params.key == 'replace') { // 图片替换
            const url = params.value
            var imageObj = new Image();
            imageObj.crossOrigin = 'Anonymous';
            imageObj.onload = function () {
                activeNode.image(imageObj)
                activeNode.setAttrs({
                    imageSource: url
                });
            };
            imageObj.src = url;
        }
    } else if (params.type == "download") {
        downloadImage(params)
    } else if (params.type == "export") {
        exportStageToJSON(params)
    }

}

const exportStageToJSON = () => {
   const json = stage.toJSON()
   if (navigator.clipboard) {
        navigator.clipboard.writeText(json);
        ElMessage({
            message: '已复制!',
            type: 'success',
        })
    }
}

const clearTransformer = () => {
    // activeCropLayer.destroy()
    // stage.find('Transformer')[0].nodes([]);
    tr.nodes([]);
    transformerContainer && transformerContainer.detach()
    transformerRect && transformerRect.destroy()
    emitToBar('reset', {})
}
const drawDataURIOnCanvas = async (strDataURI, canvas) => {
    return new Promise((resolve, reject) => {
        var img = new window.Image();
        img.addEventListener("load", function () {
            var ctx = canvas.getContext("2d");
            canvas.width = img.width
            canvas.height = img.height
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = "#fff";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            canvas.getContext("2d").drawImage(img, 0, 0);
            resolve()
        });
        img.setAttribute("src", strDataURI);
    })
}
const downloadImage = async () => {
    clearTransformer()

    const imageURL1 = stage.toDataURL({pixelRatio: 4, quality: 1, mimeType: 'image/png'})
    let ele = document.getElementById("downloadCanvas")
    await drawDataURIOnCanvas(imageURL1, ele)
    const imageURL = ele.toDataURL("image/jpeg")

    const link = document.createElement('a')
    link.href = imageURL
    link.download = 'ddm-' + new Date().getUTCMilliseconds()
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
}
const loadTextConfig = (params, image) => {
    let group = null
    if (params.config.length > 1) {
        group = new Konva.Group({draggable: true});
        layer.add(group);
    }

    params.config.forEach(element => {
        var node = new Konva.Text(element);
        if (image) {
            node.fillPatternImage(image)
            node.fillPatternScale({
                x: 0.1,
                y: 0.1
            });
            node.setAttr('fillPatternImageSource', image.src);
        }
        node.on('dblclick', function (e) {
            // textNodeEdit(node)
            e.evt.preventDefault();
        });
        node.on('click', function (e) {
            activeNode = node
            tr.nodes([node]);
            emitToBar('text', node.toJSON())
            e.evt.preventDefault();
        });

        if (group) {
            group.add(node)
            tr.nodes([group])
        } else {
            layer.add(node);
            tr.nodes([node])
        }
        activeNode = node
    });
    emitToBar('text', activeNode.toJSON())
}

const addText = (params) => {
    let config = params.config
    if (config[0].fillPatternImage) {
        var imageObj1 = new Image();
        imageObj1.crossOrigin = 'Anonymous';
        imageObj1.onload = function () {
            loadTextConfig(params, imageObj1);
        };
        imageObj1.src = config[0].fillPatternImage
    } else {
        loadTextConfig(params);
    }
}

const emitToBar = (type, config) => {
    console.log("emit event::emitToBar:", type, config)
    eventBus.emit('edit2Bar', {type, config})
}

// 监听模板发送的消息事件
const onTemplateAction = (data:any) => {
    console.log("onTemplateAction:", data)
    if (data.type === "template") {
        addTemplate(data.params)
    } else if (data.type === "text") {
        console.log("onTemplateAction::text:", data.params)
        addText(data.params)
    }else if(data.type === "material") {
        addMaterial(data.params)
    }
}

const addMaterial = (params) => {
    console.log("--addMaterial:", params)
    if (params.config) {
        var node = new Konva.Image(params.config[0]);
        var imageObj = new Image();
        imageObj.crossOrigin = 'Anonymous';
        imageObj.onload = function () {
            node.image(imageObj);
        };
        imageObj.src = params.config[0].url;

        node.on('click', function (e) {
            activeNode = node
            tr.nodes([node]);
            emitToBar('image', node.toJSON())
            e.evt.preventDefault();
        });

        layer.add(node)
        tr.nodes([node])
        activeNode = node
        emitToBar('image', activeNode.toJSON())
    } 
}

const addTemplate = (json) => {
    console.log("--addImage:", json)
    initStage(json)
}

// 启用侦听
eventBus.on('addTemplate', onTemplateAction)
eventBus.on('edit', onEditBarAction)

</script>
