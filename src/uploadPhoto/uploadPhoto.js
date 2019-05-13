import React, { PropTypes } from "react";
import autoBind from "react-autobind";
import { ImagePicker, Toast, Modal, Carousel } from "antd-mobile";
import uploadImage from "./../utils/util";
import "antd-mobile/lib/image-picker/style/css";
import "antd-mobile/lib/toast/style/css";
import "antd-mobile/lib/modal/style/css";
import "./uploadPhoto.css";

import {
  getData,
  compress,
  rotateImage,
  base64ToBlob,
    base64ToFile
} from "./../utils/exif";
//两个数组中不同的项
function getArrDifference(arr1, arr2) {
  return arr1.concat(arr2).filter(function(v, i, arr) {
    return arr.indexOf(v) === arr.lastIndexOf(v);
  });
}
function closest(el, selector) {
    const matchesSelector = el.matches || el.webkitMatchesSelector || el.mozMatchesSelector || el.msMatchesSelector;
    while (el) {
        if (matchesSelector.call(el, selector)) {
            return el;
        }
        el = el.parentElement;
    }
    return null;
}
function loadingToast(options) {
  Toast.loading(
    options.loading || "Loading...",
    options.time || 0,
    callback => {
      console.log("Load complete !!!");
      options.callback &&
        typeof options.callback === "function" &&
        options.callback();
    }
  );
}

class UploadPhoto extends React.Component {
  constructor(props) {
    super(props);
    autoBind(this);
      let files = [];
      this.props.defaultPhoto&&this.props.defaultPhoto.length>0&&this.props.defaultPhoto.map(item=>{
          files.push({url: item});
      });
    this.state = {
      files: files,
      multiple: false,
      showMultiple: false,
      previewData: []
    };
  }

  componentWillMount() {}

  componentDidMount() {}

  componentWillReceiveProps() {}

  componentWillUnmount() {}

  onChange(files, type, index) {
    if (type === "remove") {
        if('selectable' in this.props) {
            if(!this.props.selectable) {
                return;
            }
            this.props.onChange(files);
            this.setState({
                files
            });
            return;
        }
      this.props.onChange(files);
      this.setState({
        files
      });
    }
    if (type === "add") {
      const stateFiles = this.state.files;
      let arr = getArrDifference(files, stateFiles);
      if (!arr.length) return;
      this.uploadPhoto(arr, serverImg => {
        let files = this.state.files;
        files.push(serverImg);
        this.props.onChange(files);
        this.setState({
          ...files
        });
      });
    }
  };

  uploadPhoto(imgArr, callback, index = 0) {
      //判断上传的数量有没有超出总数量，超出时停止上传
      if(this.props.multiple&&this.props.total&&(this.state.files.length >= this.props.total)) {
          Toast.hide();
          return;
      }
      if(this.props.showToast) {
          loadingToast({
              loading: `上传中${index}/${imgArr.length}`
          });
      }
    if (!imgArr.length) return;
    if ((index >= imgArr.length - 1) && this.props.showToast) {
      Toast.success("上传成功", 0.3);
      setTimeout(() => {
        Toast.hide();
      }, 300);
    }
    if (index < imgArr.length) {
        var that = this;
        var Orientation = imgArr[index].orientation;
        //url是base64，转化为了file
        var file = base64ToFile(imgArr[index].url, imgArr[index].file.name)
        getData(file, ()=> {
          // 确认选择的文件是图片
          if (file.type.indexOf("image") == 0) {
            var reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = function(e) {
              var result = this.result;
              var img = new Image();
              img.src = result;
              var data = result;
              img.onload = function() {
                data = rotateImage(img, Orientation);
                var img2 = new Image();
                img2.src = data;
                var data2;
                img2.onload = function() {
                    //压缩图片
                    data2 = compress(img2, Orientation);
                    //将base64转化为file类型上传
                    let conversions = base64ToFile(data2, imgArr[index].file.name, "image/jpeg");
                    uploadImage(`${that.props.apiHost||'http://localhost:40005'}/api/upload`, {
                      method: "POST",
                      data: { file: { file: conversions } }
                    }).then(json => {
                      if (json.error_code === 0) {
                        index++;
                        callback(json.data);
                        that.uploadPhoto(imgArr, callback, index);
                      }else {
                          console.log('上传失败，服务器出错')
                      }
                    });
                  };
                };
              };
            }
          });
    }
  }
  onFail(msg) {
    console.log("选择失败", msg);
  };

  onAddImageClick(e) {
    console.log(e.target);
  }
  onImageClick(index, fs) {
    const { files } = this.state;
    const data = files.map(item => item.url);
    this.setState({
      previewData: data[index],
      showMultiple: true,
      defaultIndex: index
    });
    if(this.props.onPreview) {
        this.props.onPreview();
    }
  };
    onClose() {
        this.setState({
            showMultiple: false,
        });
    }
    onWrapTouchStart(e) {
        if (!/iPhone|iPod|iPad/i.test(navigator.userAgent)) {
            return;
        }
        const pNode = closest(e.target, '.am-modal-content');
        if (!pNode) {
            e.preventDefault();
        }
        console.log(12312)
    }
  render() {
    const { files } = this.state;
    return (
      <div
        id={this.props.id || "uploadPhone"}
        className="uploadPhone"
        style={{ ...this.props.style }}
      >
        <ImagePicker
            {...this.props}
          files={files}
          onChange={this.onChange}
          onImageClick={(index, fs) => this.onImageClick(index, fs)}
          selectable={'selectable' in this.props ? this.props.selectable : files.length < (this.props.total || 10)}
          onFail={this.onFail}
          onAddImageClick={this.onAddImageClick}
            disableDelete
        />
          {
              this.props.preview ? <Modal
                  platform="ios"
                  visible={this.state.showMultiple}
                  transparent
                  onClose={this.onClose}
                  closable={true}
                  wrapProps={{ onTouchStart: this.onWrapTouchStart }}
              >
                  <img style={{width: '100%', height: '100%', verticalAlign: 'top'}} src={this.state.previewData} alt=""/>
              </Modal>
                  : null
          }
      </div>
    );
  }
}

UploadPhoto.propTypes = {};

export default UploadPhoto;
