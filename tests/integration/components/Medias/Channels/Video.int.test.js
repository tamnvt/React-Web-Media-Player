import React from 'react';
import Enzyme, { mount } from 'enzyme';
import createTestStore from '../../../Utils';
import Adapter from 'enzyme-adapter-react-16';
import { isIE } from '../../../../../src/services/Utils';
import Video from '../../../../../src/components/Medias/Channels/Video';
import { Provider } from 'react-redux';
import { formatResultsErrors } from 'jest-message-util';
Enzyme.configure({ adapter: new Adapter() });

describe('Integration tests - Video', () => {

    let store;
    let dispatchSpy;
    const loadSpy = jest.fn();
    const playSpy = jest.fn();
    const pauseSpy = jest.fn();

    window.HTMLMediaElement.prototype.load = loadSpy;
    window.HTMLMediaElement.prototype.play = playSpy;
    window.HTMLMediaElement.prototype.pause = pauseSpy;

    beforeEach(() => {
        ({ store, dispatchSpy } = createTestStore());
    });

    it('Video - load', () => {
        const initState = {
            duration: 0,
            video: "video-link",
            muted: false
        };
        store.dispatch({ type: "INIT_STATE", payload: { state: initState } });

        const videoProvider = mount(
            <Provider store={store}>
                <Video />
            </Provider>
        );
        const videoTrack = videoProvider.find("Video");
        const videoTrackInstance = videoTrack.instance();
        videoTrackInstance.video = {
            load: loadSpy,

            paused: true
        }

        videoTrackInstance.load();
        expect(loadSpy).toHaveBeenCalled();
        jest.clearAllMocks();
    });

    it('Video - when reinit player props call load to restart video state', () => {
        const initState = {
            duration: 50,
            video: "video-link",
            muted: false,
            initTime: new Date("Tue Jan 12 21:33:28 +0000 2010")
        };
        store.dispatch({ type: "INIT_STATE", payload: { state: initState } });

        const videoProvider = mount(
            <Provider store={store}>
                <Video />
            </Provider>
        );
        const initState2 = {
            duration: 100,
            video: "video-link2",
            muted: false,
            initTime: new Date()
        };
        store.dispatch({ type: "INIT_STATE", payload: { state: initState2 } });
        expect(loadSpy).toHaveBeenCalled();
    });

    it('Video - Play', () => {
        const initState = {
            duration: 0,
            video: "video-link",
            muted: false
        };
        store.dispatch({ type: "INIT_STATE", payload: { state: initState } });
        const playedResolvePromise = jest.fn();

        const videoProvider = mount(
            <Provider store={store}>
                <Video />
            </Provider>
        );
        const videoTrack = videoProvider.find("Video");
        const videoTrackInstance = videoTrack.instance();
        videoTrackInstance.video = {
            play: playSpy.mockImplementation(() => new Promise((resolve, reject) => {
                playedResolvePromise()
                resolve()
            })),
            paused: true
        }
        videoTrackInstance.play();
        expect(playSpy).toHaveBeenCalled();
        expect(playedResolvePromise).toHaveBeenCalled();
        jest.clearAllMocks();

        videoTrackInstance.video = {
            play: playSpy.mockImplementation(() => new Promise((resolve, reject) => {
                playedResolvePromise()
                resolve()
            })),
            paused: false
        }
        videoTrackInstance.play();
        expect(playSpy).not.toHaveBeenCalled();
        expect(playedResolvePromise).not.toHaveBeenCalled();
        jest.clearAllMocks();
    });

    it('Video - Pause', () => {
        const initState = {
            duration: 0,
            video: "video-link",
            muted: false
        };
        store.dispatch({ type: "INIT_STATE", payload: { state: initState } });

        const videoProvider = mount(
            <Provider store={store}>
                <Video />
            </Provider>
        );
        const videoTrack = videoProvider.find("Video");
        const videoTrackInstance = videoTrack.instance();
        videoTrackInstance.video = {
            pause: pauseSpy,
            paused: false
        }
        videoTrackInstance.pause();
        expect(pauseSpy).toHaveBeenCalled();
        jest.clearAllMocks();

        videoTrackInstance.video = {
            pause: pauseSpy,
            paused: true
        }
        videoTrackInstance.pause();
        expect(pauseSpy).not.toHaveBeenCalled();
        jest.clearAllMocks();
    });

    it('Video - Stop', () => {
        const initState = {
            duration: 120,
            video: "video-link",
            muted: false
        };
        store.dispatch({ type: "INIT_STATE", payload: { state: initState } });

        const videoProvider = mount(
            <Provider store={store}>
                <Video />
            </Provider>
        );
        const videoTrack = videoProvider.find("Video");
        const videoTrackInstance = videoTrack.instance();
        videoTrackInstance.video = {
            pause: pauseSpy,
            paused: false,
            duration:120,
            currentTime:0
        }
        videoTrackInstance.stop();
        expect(pauseSpy).toHaveBeenCalled();
        expect(videoTrackInstance.video.currentTime).toBe(120);
        jest.clearAllMocks();

        videoTrackInstance.video = {
            pause: pauseSpy,
            paused: true,
            duration:120,
            currentTime:0
        }
        videoTrackInstance.stop();
        expect(pauseSpy).not.toHaveBeenCalled();
        expect(videoTrackInstance.video.currentTime).toBe(120);
        jest.clearAllMocks();
    });

    it('Video - render - adapt width', () => {
        let initState = {
            duration: 120,
            video: "video-link",
            isFullscreenActivated: true,
            videoWidth: 500,
            videoHeight: 250,
            fullscreenWidth: 1000,
            fullscreenHeight: 500
        };
        store.dispatch({ type: "INIT_STATE", payload: { state: initState } });

        const videoProvider = mount(
            <Provider store={store}>
                <Video />
            </Provider>
        );
        const videoTrack = videoProvider.find('Video');
        const videoTrackInstance = videoTrack.instance();

        expect(videoTrackInstance.render().props.width).toBe(1024);
        expect(videoTrackInstance.render().props.height).toBe(512);
        expect(videoTrackInstance.render().props.style.marginTop).toBe(128);
        expect(videoTrackInstance.render().props.style.marginLeft).toBe(undefined);

    });

    it('Video - render - adapt height', () => {
        let initState = {
            duration: 120,
            video: "video-link",
            isFullscreenActivated: true,
            videoWidth: 250,
            videoHeight: 500,
        };
        store.dispatch({ type: "INIT_STATE", payload: { state: initState } });

        const videoProvider = mount(
            <Provider store={store}>
                <Video />
            </Provider>
        );
        const videoTrack = videoProvider.find('Video');
        const videoTrackInstance = videoTrack.instance();

        expect(videoTrackInstance.render().props.width).toBe(384);
        expect(videoTrackInstance.render().props.height).toBe(768);
        expect(videoTrackInstance.render().props.style.marginTop).toBe(undefined);
        expect(videoTrackInstance.render().props.style.marginLeft).toBe((1024-384)/2);

    });

    it('Video - displayVideo', () => {
        window.screen.__defineGetter__('width', function(){
            return 1000;
        });

        window.screen.__defineGetter__('height', function(){
            return 1000;
        });

        let initState = {
            isFullscreenActivated: false,
            width:560,
            height: 315
        };
        
        store.dispatch({ type: "INIT_STATE", payload: { state: initState } });

        const videoProvider = mount(
            <Provider store={store}>
                <Video />
            </Provider>
        );
        const videoTrack = videoProvider.find("Video");
        const videoTrackInstance = videoTrack.instance();
        videoTrackInstance.video = {
            width: 0,
            heigth: 0
        }

        videoTrackInstance.displayVideo();
        expect(videoTrackInstance.video.width).toBe(560);
        expect(videoTrackInstance.video.height).toBe(315);

        initState = {
            isFullscreenActivated: true,
            width:560,
            height: 315
        };
        
        store.dispatch({ type: "INIT_STATE", payload: { state: initState } });

        videoTrackInstance.video = {
            width: 0,
            heigth: 0
        }

        videoTrackInstance.displayVideo();
        expect(videoTrackInstance.video.width).toBe(1000);
        expect(videoTrackInstance.video.height).toBe(1000);

    });

    it('Video - timeRangeBuffered', () => {
        const initState = {
            duration: 0,
            video: "video-link",
            muted: false
        };
        store.dispatch({ type: "INIT_STATE", payload: { state: initState } });

        const videoProvider = mount(
            <Provider store={store}>
                <Video />
            </Provider>
        );
        const videoTrack = videoProvider.find("Video");
        const videoTrackInstance = videoTrack.instance();
        videoTrackInstance.video = {
            buffered: {
                0:{start:0, end:5},
                1:{start:30, end:40},
                2:{start:60, end:111},
                3:{start:115, end:120},
                length: 4,
                start: (i) => videoTrackInstance.video.buffered[i].start,
                end: (i) => videoTrackInstance.video.buffered[i].end
            }
        }
        expect(videoTrackInstance.timeRangeBuffered(0)).toBe(5);
        expect(videoTrackInstance.timeRangeBuffered(6)).toBe(6);
        expect(videoTrackInstance.timeRangeBuffered(59)).toBe(59);
        expect(videoTrackInstance.timeRangeBuffered(60)).toBe(111);
        expect(videoTrackInstance.timeRangeBuffered(111)).toBe(111);
        expect(videoTrackInstance.timeRangeBuffered(115)).toBe(120);
        expect(videoTrackInstance.timeRangeBuffered(120)).toBe(120);
        expect(videoTrackInstance.timeRangeBuffered(130)).toBe(130);
    });

    it('Video - events - Internet Explorer', () => {
        const initState = {
            duration: 0,
            video: "video-link",
            muted: false
        };

        navigator.__defineGetter__('userAgent', function(){
            return 'Trident MSIE' // customized user agent
        });

        expect(isIE()).toBeTruthy()

        store.dispatch({ type: "INIT_STATE", payload: { state: initState } });

        const videoProvider = mount(
            <Provider store={store}>
                <Video />
            </Provider>
        );
        const videoTrack = videoProvider.find("Video");
        const videoTrackInstance = videoTrack.instance();
        videoTrackInstance.video = {
            duration: 120,
            videoWidth: 560,
            videoHeight:315,
            currentTime:80
        }
        expect(videoTrackInstance.getDuration()).toBe(120);

        videoTrack.simulate("waiting");
        expect(dispatchSpy).not.toHaveBeenCalledWith({ type: 'VIDEO_IS_NOT_READY' });
        jest.clearAllMocks();

        videoTrack.simulate("canplaythrough");
        expect(dispatchSpy).toHaveBeenCalledWith({ type: 'VIDEO_IS_READY' });
        jest.clearAllMocks();

        videoTrack.simulate("loadedmetadata");
        expect(dispatchSpy).toHaveBeenCalledWith({ type: 'UPDATE_DURATION', payload: { duration: 120 } });
        expect(dispatchSpy).toHaveBeenCalledWith({ type: 'UPDATE_VIDEO_WIDTH', payload: { videoWidth: 560 } });
        expect(dispatchSpy).toHaveBeenCalledWith({ type: 'UPDATE_VIDEO_HEIGHT', payload: { videoHeight: 315 } });
        jest.clearAllMocks();

        /*videoTrack.simulate("seeking");
        expect(dispatchSpy).toHaveBeenCalledWith({ type: 'VIDEO_IS_NOT_READY' });
        jest.clearAllMocks();*/

        videoTrack.simulate("seeked");
        expect(dispatchSpy).toHaveBeenCalledWith({ type: 'VIDEO_IS_READY' });
        jest.clearAllMocks();

        videoTrack.simulate("play");
        expect(dispatchSpy).toHaveBeenCalledWith({ type: 'VIDEO_IS_READY' });
        jest.clearAllMocks();

        videoTrackInstance.video = {
            duration: 120,
            videoWidth: 560,
            videoHeight: 315,
            currentTime: 120
        }

        videoTrack.simulate("seeking");
        expect(dispatchSpy).not.toHaveBeenCalledWith({ type: 'VIDEO_IS_NOT_READY' });
        jest.clearAllMocks();
    });

    it('Video - events - Chrome/Firefox/Safari...', () => {
        const initState = {
            duration: 0,
            audio: "audio-link",
            hasVinyl: true,
            muted: false
        };

        navigator.__defineGetter__('userAgent', function(){
            return 'Mozilla/5.0 (win32) AppleWebKit/537.36 (KHTML, like Gecko) jsdom/11.12.0'
        });

        expect(isIE()).toBeFalsy()

        store.dispatch({ type: "INIT_STATE", payload: { state: initState } });

        const videoProvider = mount(
            <Provider store={store}>
                <Video />
            </Provider>
        );
        const videoTrack = videoProvider.find("Video");
        const videoTrackInstance = videoTrack.instance();
        videoTrackInstance.video = {
            duration: 120,
            videoWidth: 560,
            videoHeight:315,
            currentTime:80
        }
        expect(videoTrackInstance.getDuration()).toBe(120);

        videoTrack.simulate("waiting");
        expect(dispatchSpy).toHaveBeenCalledWith({ type: 'VIDEO_IS_NOT_READY' });
        jest.clearAllMocks();

        videoTrack.simulate("canplaythrough");
        expect(dispatchSpy).toHaveBeenCalledWith({ type: 'VIDEO_IS_READY' });
        jest.clearAllMocks();

        videoTrack.simulate("loadedmetadata");
        expect(dispatchSpy).toHaveBeenCalledWith({ type: 'UPDATE_DURATION', payload: { duration: 120 } });
        expect(dispatchSpy).toHaveBeenCalledWith({ type: 'UPDATE_VIDEO_WIDTH', payload: { videoWidth: 560 } });
        expect(dispatchSpy).toHaveBeenCalledWith({ type: 'UPDATE_VIDEO_HEIGHT', payload: { videoHeight: 315 } });
        jest.clearAllMocks();

        videoTrack.simulate("seeking");
        expect(dispatchSpy).not.toHaveBeenCalledWith({ type: 'AUDIO_IS_NOT_READY' });
        jest.clearAllMocks();

        videoTrack.simulate("seeked");
        expect(dispatchSpy).not.toHaveBeenCalledWith({ type: 'AUDIO_IS_READY' });
        jest.clearAllMocks();

        videoTrack.simulate("play");
        expect(dispatchSpy).not.toHaveBeenCalledWith({ type: 'AUDIO_IS_READY' });
        jest.clearAllMocks();


        videoTrackInstance.audio = {
            duration: 120,
            currentTime:120
        }

        videoTrack.simulate("waiting");
        expect(dispatchSpy).not.toHaveBeenCalledWith({ type: 'AUDIO_IS_NOT_READY' });
        jest.clearAllMocks();
    });
});