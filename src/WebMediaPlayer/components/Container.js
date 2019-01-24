import React, { Component } from 'react';
import { connect } from 'react-redux';
import './Container.css';
import fscreen from "fscreen";
import TitleBar from "./TitleBar/TitleBar";
import MenuBar from "./MenuBar/MenuBar";
import Spinner from "./Loading/Spinner"
import Thumbnail from "./Init/Thumbnail"
import Video from "./Medias/Video";
import Audio from "./Medias/Audio";
import Slideshow from "./Medias/Slideshow";
import LargePlayButton from "./Init/LargePlayButton";

class Container extends Component {
    constructor(props) {
        super(props);
        this.fscreen = fscreen;
    }

    componentDidMount = () => {
        fscreen.addEventListener("fullscreenchange", this.detectFullScreen.bind(this));
    }

    componentWillUnmount = () => {
        fscreen.removeEventListener("fullscreenchange", this.detectFullScreen.bind(this));
    }

    componentDidUpdate = () => {
        this.handlePropsChanges(this.props);
    }

    handlePropsChanges = (props) => {
        const enabled = fscreen.fullscreenElement;
        if (enabled && !props.isFullscreen) {
            this.leaveFullScreen();
        } else if (!enabled && props.isFullscreen) {
            this.enterFullScreen();
        }
    }

    detectFullScreen = () => {
        if (this.fscreen.fullscreenElement == null) {
            if (this.props.isFullscreen) {
                this.props.dispatch({ type: 'SWITCH_FULLSCREEN_STATE' });
            }
            this.props.dispatch({ type: 'FULL_SCREEN_DISABLED' });
        } else {
            this.props.dispatch({ type: 'FULL_SCREEN_ENABLED' });
        }
    }

    enterFullScreen = () => {
        if (fscreen.fullscreenEnabled) {
            fscreen.requestFullscreen(this.node);
        }
    }

    leaveFullScreen = () => {
        if (fscreen.fullscreenEnabled) {
            fscreen.exitFullscreen();
        }
    }

    handleMouseEnter = (e) => {
        e.stopPropagation();
        if (!this.props.isInitialized) {
            this.props.dispatch({ type: 'HIGHLIGHT_PLAYER' });
        } else if (this.props.isPlaying) {
            this.props.dispatch({ type: 'SHOW_MENUS' });
        }
    }

    handleMouseLeave = (e) => {
        e.stopPropagation();
        if (!this.props.isInitialized) {
            this.props.dispatch({ type: 'UNHIGHLIGHT_PLAYER' });
        } else if (this.props.isPlaying) {
            this.props.dispatch({ type: 'HIDE_MENUS' });
        }
    }

    handleMouseMove = (e) => {
        e.stopPropagation();
        if (!this.props.isInitialized) {
            this.props.dispatch({ type: 'USER_ACTIVE' });
        }
    }

    handleClick = (e) => {
        e.stopPropagation();
        if (!this.props.isInitialized){
            this.props.dispatch({ type: 'INITIALIZE_PLAYER' });
            this.props.dispatch({ type: 'PLAY' });
        }
    }

    render = () => {
        const className = ["wmp-container", "fullscreen"];
        const style = {
            width: this.props.width + "px",
            height: this.props.height + "px"
        }
        if (this.props.isFullScreenActivated) {
            className.push("fullscreen-enabled");
            style.width = "100%";
            style.height = "100%";
        }


        let thumbnail, video, audio, slideshow, largePlayButton, menuBar, titleBar;
        if (this.props.thumbnail && !this.props.isInitialized)
            thumbnail = <Thumbnail />;
        if (this.props.isInitialized && this.props.showMenus) {
            menuBar = <MenuBar />
        }
        if (!this.props.isInitialized){
            largePlayButton = <LargePlayButton />;
        }
        if (!this.props.isInitialized || this.props.showMenus) {
            titleBar = <TitleBar />
        }
        if (this.props.hasVideo) {
            video = <Video />;
        } else if (this.props.hasAudio) {
            audio = <Audio />;
            slideshow = <Slideshow />
        } else if (this.props.hasSlideshow) {
            slideshow = <Slideshow />
        }
        return (
            <div className={className.join(" ")} style={style} ref={node => (this.node = node)} onMouseEnter={this.handleMouseEnter} onMouseLeave={this.handleMouseLeave} onMouseMove={this.handleMouseMove} onClick={this.handleClick}>
                <Spinner />
                {thumbnail}
                {largePlayButton}
                {titleBar}
                {menuBar}
                {video}
                {audio}
                {slideshow}
            </div>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        width: state.width,
        height: state.height,
        thumbnail: state.thumbnail,
        hasVideo: state.hasVideo,
        hasAudio: state.hasAudio,
        hasSlideshow: state.hasSlideshow,
        isInitialized: state.isInitialized,
        isFullscreen: state.isFullscreen,
        showMenus: state.showMenus,
        isPlaying: state.isPlaying,
    };
};

export default connect(mapStateToProps)(Container);
/*
          <video width="560" height="315">
              <source src="https://nusid.net/video.mp4" />
          </video>
*/