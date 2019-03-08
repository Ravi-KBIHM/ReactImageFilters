import React, { Component } from 'react';
import {
  View,
  Platform,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import Camera from '../lib/react-native-camera';
import CaptureButton from '../lib/capture-button/CaptureButton';
import PictureView from '../lib/picture-view/PictureView';
import VideoView from '../lib/video-view/VideoView';
import ToggleButton from '../lib/toggle-button/ToggleButton';
import MultiClipManager from '../lib/multiclip-manager/MultiClipManager';
import LoaderButton from '../lib/loader-button/LoaderButton';
import { Surface } from "gl-react-native";
import ImageFilters from "react-native-gl-image-filters";

class CameraView extends Component {

  constructor(props){
    super(props);
    this.state = {
      cameraOn: true,
      multiClipMode: false,
      flash: false,
      facing: "back",
      torch: "off",
      recording: false,
      video: null,
      picture: null,
      clicked:false,
      newPicture: ""
    }
    this.camera = null;
    this.captureButton = null;
    this.mcManager = null;
    this.fullsreenClip = this.fullsreenClip.bind(this);
    this.popVideoClip = this.popVideoClip.bind(this);
    this.submitVideo = this.submitVideo.bind(this);
    this.submitPicture = this.submitPicture.bind(this);

  }

  toggleFlash(){
    this.setState({flash: !this.state.flash});
  }

  switchFacing(){
    this.setState({facing: this.state.facing  == "back" ? "front" : "back"});
  }

  startRecording(){
    if(this.camera != null){

      var capture = () => {
        this.camera.startRecording().then((data)=>{
          if(this.state.multiClipMode && this.mcManager != null){
            this.mcManager.pushClip(data);
          }else{
            this.setState({video: data});
          }
        }).catch((error)=>{
            if(this.captureButton){
              this.captureButton.resetTimer(1000);
            }
        });
      }
      if(this.state.flash){
        this.setState({recording: true, torch: "on"});
        setTimeout(capture,600);
      }else{
        this.setState({recording: true});
        capture();
      }
    }
  }

  stopRecording(){
    if(this.camera != null){
      this.camera.stopRecording().catch((error)=>{});
      this.setState({recording: false, torch: "off"});
    }
  }


  takePicture(){
    if(this.camera != null && !this.state.multiClipMode){
        var snap = () => {
            this.camera.stopPreview();
            this.camera.screenshot().then((data)=>{
              this.setState({picture: data.path, newPicture: data.path, torch: "off", clicked: true});
            }).catch((error)=>{});
        }
        if(this.state.flash){
          this.setState({torch: "on"});
          setTimeout(snap,600); //let torch turn on and camera exposure adjust
        }else{
          snap();
        }
    }
  }

  stitchClips(){
    var that = this;
    return new Promise(function(resolve, reject) {
      if(that.state.multiClipMode && that.camera){
        that.camera.stitchVideoClips().then((data)=>{
          that.setState({multiClipMode: false, video: data});
          resolve();
        }).catch((error)=>{
          reject();
        })
      }else{
        reject();
      }
    });
  }

  clearClips(){
    if(this.state.multiClipMode || this.camera){
      this.camera.clearVideoClips();
      this.setState({multiClipMode: false});
    }
  }

  cancelVideo(){
    if(this.captureButton){this.captureButton.resetTimer();}
    this.camera.deleteVideoClip();
    this.setState({video: null});
  }

  popVideoClip(clip, empty){
    if(this.captureButton){
      this.captureButton.resetTimer(clip.duration);
    }
    if(empty){
      //no more clips in stack, revert to default mode
      this.setState({multiClipMode: false});
    }
    this.camera.deleteVideoClip();
  }

  cancelPicture(){
    this.camera.startPreview();
    this.camera.deletePicture();
    this.setState({picture: null});
  }

  saveVideo(){
    return this.camera.saveCurrentClip();
  }

  savePicture(){
    return this.camera.savePicture();
  }

  fullsreenClip(clip){
    this.setState({video: clip});
  }

  exitFullscreen(){
    this.setState({video: null});
  }

  enableMultiClipMode(){
    var data = this.state.video;
    this.setState({video: null, multiClipMode: true}, ()=>{
      if(this.mcManager != null){
        this.mcManager.pushClip(data);
      }
    });
  }

  submitVideo(caption, muted){
    if(this.state.video){
      //@TODO submit to backend & navigate
    }
  }
  submitPicture(caption){
    if(this.state.picture){
      //@TODO submit to backend & navigate
    }
  }

  changeImage = () => {
    console.log('type')
    if (this.image1) {
      console.log('captures_image:', this.image1.captureFrame())
      this.image1.captureFrame() // <= you can pass config here, check docs
      .then(value=>{
        console.log('cap_image:', value)
        this.setState({picture:value})
      });
    } 
  }

  changeImage2 =()=>{
    if(this.image2){
      console.log('captures_image:', this.image2.captureFrame())
      this.image2.captureFrame() // <= you can pass config here, check docs
      .then(value=>{
        console.log('cap_image:', value)
        this.setState({picture:value})
      });
    }
  }

  changeImage3 =() => {
    if(this.image3){
      console.log('captures_image:', this.image3.captureFrame())
      this.image3.captureFrame() // <= you can pass config here, check docs
      .then(value=>{
        console.log('cap_image:', value)
        this.setState({picture:value})
      });
    }
  }

  changeImage4 =()=>{
    if(this.image4){
      console.log('captures_image:', this.image4.captureFrame())
      this.image4.captureFrame() // <= you can pass config here, check docs
      .then(value=>{
        console.log('cap_image:', value)
        this.setState({picture:value})
      });
    }
  }

  renderPictureClicked(){
    if(this.state.clicked){
    return  <View style={{flexDirection:'row', zIndex:2}}>    
           <TouchableOpacity
              onPress={this.changeImage} >
            
                <Surface
                width={100}
                height={100}
                position='absolute'
                top= {2}
                left= {2}
                right= {2}
                bottom= {2}
                ref={ref => (this.image1 = ref)}
              >
                <ImageFilters
                  width={100}
                  height={100}
                  temperature={5000}
                  sharpen={0.5}
                  hue={0.5}
                >
                {this.state.newPicture}
                </ImageFilters>
              </Surface>
            
            </TouchableOpacity>
            <TouchableOpacity
              onPress={this.changeImage2} >
         
              <Surface
                width={100}
                height={100}
                position='absolute'
                top= {2}
                left= {2}
                right= {2}
                bottom= {2}
                zIndex= {2}
                ref={ref => (this.image2 = ref)}
              >
                <ImageFilters
                  width={100}
                  height={100}
                  sharpen={1}
                  hue={0.5}
                >
                {this.state.newPicture}
                </ImageFilters>
              </Surface>
           
            </TouchableOpacity>
            <TouchableOpacity
              onPress={this.changeImage3} >
           
              <Surface
                width={100}
                height={100}
                position='absolute'
                top= {2}
                left= {2}
                right= {2}
                bottom= {2}
                zIndex= {2}
                ref={ref => (this.image3 = ref)}
              >
                <ImageFilters
                  width={100}
                  height={100}
                  temperature={10000}
                >
                {this.state.newPicture}
                </ImageFilters>
              </Surface>
           
            </TouchableOpacity>
            <TouchableOpacity
              onPress={this.changeImage4} >
           
              <Surface
                width={100}
                height={100}
                position='absolute'
                top= {2}
                left= {2}
                right= {2}
                bottom= {2}
                zIndex= {2}
                ref={ref => (this.image4 = ref)}
              >
                <ImageFilters
                  width={100}
                  height={100}
                  hue={0.5}
                  temperature={1000}
                >
                {this.state.newPicture}
                </ImageFilters>
              </Surface>
          
            </TouchableOpacity>
            </View> ;
    }
}

  renderCamera(){
    if(this.state.cameraOn){
      return (<Camera
                ref={(cam) => {
                  this.camera = cam;
                }}
                style={styles.camera}
                aspect={Camera.constants.Aspect.fill}
                captureTarget={Camera.constants.CaptureTarget.temp}
                type={this.state.facing}
                torchMode={this.state.torch}
                captureAudio={true}
                captureQuality={"1080p"}
                captureMode={"video"}
                playSoundOnCapture={false}>
                </Camera>
              );
    }else{
      return null;
    }
  }

  renderRightCameraControl(hide, opacity){
    if(this.state.multiClipMode){
         return (<LoaderButton
           disabled={hide}
           style={styles.iconButton}
           iconStyle={opacity}
           iconSize={34}
           color="#FFF"
           icon={"stop-circle-outline"}
           onPress={this.stitchClips.bind(this)}/>
         );
    }else{
      return (
          <ToggleButton disabled={hide} style={styles.iconButton}
        iconSize={34}
        color="#FFF"
        icon={"camera-party-mode"}
        toggledIcon={"emoticon-tongue"}
        forceDefault={this.state.facing == "front"}
        onPress={this.switchFacing.bind(this)}/>
      );
    }
  }

  renderCameraControls(){
    const overlay = this.state.picture != null || this.state.video != null;
    const hide = this.state.recording || overlay;

    const opacity = {opacity: hide == true ? 0 : 1};
    const opacity2 = {opacity: overlay == true ? 0 : 1};

    return (<View style={styles.bottomControls}>
             <ToggleButton disabled={hide} style={styles.iconButton}
                  iconSize={34}
                  color="#FFF"
                  icon={"flash-off"}
                  toggledIcon={"flash"}
                  onPress={this.toggleFlash.bind(this)}/>
              <CaptureButton
               style={opacity2}
               disabled={overlay}
               ref={(ref)=>{this.captureButton = ref}}
               onPressOut={this.takePicture.bind(this)}/>
               {this.renderRightCameraControl(hide, opacity)}
            </View>);
  }

  renderMultiClipManager(){
    if(this.state.multiClipMode){
      return (<View style={styles.mcManager}>
        <MultiClipManager
        ref={(ref) => this.mcManager = ref}
        style={{flex: 1}}
        onClearClips={this.clearClips.bind(this)}
        onPopClip={(data, empty) => {this.popVideoClip(data, empty)}}
        onFullScreen={(clip)=>{this.fullsreenClip(clip)}}
        />
      </View>);
    }else{
      return null;
    }
  }
  render(){
    return (
      <View style={styles.container}>
        {this.renderCamera()}
        <View style={styles.uiContainer}>
          {this.renderMultiClipManager()}
          {this.renderCameraControls()}
        </View>
        <VideoView style={styles.overlay}
          onSave={this.saveVideo.bind(this)}
          onCancel={this.cancelVideo.bind(this)}
          onBack={this.exitFullscreen.bind(this)}
          onSubmit={this.submitVideo}
          onMultiClipMode={this.enableMultiClipMode.bind(this)}
          multiClipMode={this.state.multiClipMode}
          data={this.state.video}/>
        <PictureView style={styles.overlay}
          onSave={this.savePicture.bind(this)}
          onCancel={this.cancelPicture.bind(this)}
          onSubmit={this.submitPicture}
          path={this.state.picture}/>

        {this.renderPictureClicked()}

      </View>
    )
  }
}

const styles = StyleSheet.create({
  container:{
    flex:1,
    width:'100%',
    height:'100%',
    backgroundColor:  '#000',
  },
  uiContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    flexDirection: "column",
    justifyContent: "flex-end",
    zIndex: 0
  },
  mcManager:{
    flex: .15,
    width: '100%',
  },
  bottomControls:{
    flex: .23,
    paddingBottom: '8%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  iconButton:{
    height: 50,
    width:50,
  },
  overlay:{
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 2,
    width: '100%',
    height: '100%',
  },
  camera:{
    flex: 1,
  },
});

export default CameraView;
