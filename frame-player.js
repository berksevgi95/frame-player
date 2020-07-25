var END_OF_VIDEO_INDEX = 7;
var ROW_COUNT = 5;
var FRAME_COUNT = 5;
var INTERVAL_MS = 100;

class FramePlayer {

    constructor(id) {
        this.id = id;
        this.process = null;
        
        this.counter = 0;
        this.setCounter = 0;
        this.frameCounter = 0;
        this.rowCounter = 0;
        this.counterBucket = {}

        this.eventMap = {}
        this.frameChunk = []
        this.play = this.play.bind(this)
        this.pause = this.pause.bind(this)
        this.on = this.on.bind(this)

        this.player = this._createPlayer()
        this.seeker = this._createSeeker()
        this.selector = this._createSelector()
        this.pauseScreen = this._createPauseScreen()
        document.addEventListener("DOMContentLoaded", this.render.bind(this));
    }

    render() {
        this.seeker.appendChild(this.selector);
        var container = document.getElementById(this.id)
        var wrapper = document.createElement('div')
        wrapper.style.width = '640px'
        wrapper.style.height = '370px'
        wrapper.style.overflow = 'hidden'
        wrapper.style.position = 'relative'
        wrapper.appendChild(this.player)
        wrapper.appendChild(this.seeker)
        wrapper.appendChild(this.pauseScreen)
        container.appendChild(wrapper)
        this.init()
    }

    async init() {
        var xhr = [], i;
        var call = function(i){
            xhr[i] = new XMLHttpRequest();
            xhr[i].responseType = 'arraybuffer'
            xhr[i].open("GET", `images/${i}.jpg`, true);
            xhr[i].onreadystatechange = (function(){
                if (xhr[i].readyState === 4 && xhr[i].status === 200){
                    Promise.resolve(
                        this.frameChunk.push({
                            index: i,
                            set: xhr[i].response
                        })
                    ).then((function() {
                        if(this.frameChunk.length === END_OF_VIDEO_INDEX) {
                            this.frameChunk = this.frameChunk.sort(function (a, b) {
                                if (a.index < b.index)
                                    return -1;
                                else if (a.index > b.index)
                                    return 1
                                else
                                    return 0;
                            })
                            this.eventMap['ondownloadcomplete'] && this.eventMap['ondownloadcomplete']()
                        }
                    }).bind(this))
                }
            }).bind(this);
            xhr[i].send();
        }
        call = call.bind(this)
        for(i = 0; i < END_OF_VIDEO_INDEX; i++){
            call(i);
        }

        /**
         * ATTENTION! Sensitive Content!
         * 
         * This code block contains sensitive content which some developers may find offensive or disturbing
         * because of running in O(n^3)
         */
        var i,j,k,c = 0;
        for(i=0; i < END_OF_VIDEO_INDEX; i++) {
            for(j=0; j<ROW_COUNT;j++){
                for(k=0; k<FRAME_COUNT; k++){
                    this.counterBucket[c] = [i, j, k]
                    c++
                }
            }
        }
    }

    play() {
        this.process = setInterval(() => {
            this.player.src =  URL.createObjectURL(
                new Blob([this.frameChunk[this.setCounter].set], { type: 'image/jpeg' })
            )
            var horizontalSeek = 255 - (this.frameCounter * 128)
            var verticalSeek = 144 - (this.rowCounter * 72)
            this.player.style.transform = `scale(5) translateX(${horizontalSeek}px) translateY(${verticalSeek}px)`
            this.frameCounter ++;
            if (this.frameCounter === 5){
                this.rowCounter ++;
                this.frameCounter = 0;
            }
            if(this.rowCounter === 5) {
                this.frameCounter = 0;
                this.rowCounter = 0;
                if (this.setCounter === END_OF_VIDEO_INDEX - 1)
                    this.stop()
                else
                    this.setCounter++
            }
            this.selector.style.width = `${Math.ceil((this.counter * 100) / (END_OF_VIDEO_INDEX * ROW_COUNT * FRAME_COUNT))}%`
            this.counter ++;
        }, INTERVAL_MS)
        this.eventMap['onplay'] && this.eventMap['onplay'](this.counter * INTERVAL_MS)
    }

    pause() {
        Promise.resolve(
            clearInterval(this.process)
        ).then((function () {
            this.process = null
        }).bind(this))
        this.eventMap['onpause'] && this.eventMap['onpause'](this.counter * INTERVAL_MS)
    }

    stop() {
        Promise.resolve(
            clearInterval(this.process)
        ).then((function () {
            this.process = null
            this.counter = 0;
            this.setCounter = 0;
            this.rowCounter = 0;
            this.frameCounter = 0;
        }).bind(this))
        this.eventMap['onend'] && this.eventMap['onend']()
    }

    on(eventName, callback) {
        this.eventMap[eventName] = callback
        return this;
    }


    /**
     * Pseudo private methods listed here
     */

    _createPlayer() {
        var player = document.createElement('img');
        player.style.width = '100%'
        player.style.height = 'calc(100% - 10px)'
        player.style.transform = 'scale(5) translateX(255px) translateY(144px)'
        player.addEventListener('click', this._togglePlayPause.bind(this))
        return player;
    }

    _togglePlayPause() {
        if (this.process) {
            this.pauseScreen.style.display = 'initial'
            this.pause()
        }
        else {
            this.pauseScreen.style.display = 'none'
            this.play()
        }
    }

    _createSelector() {
        var selector = document.createElement('div')
        selector.style.position = 'absolute';
        selector.style.left = '0px';
        selector.style.top = '0px';
        selector.style.height = '100%';
        selector.style.backgroundColor = 'darkred'
        return selector
    }

    _createSeeker() {
        var seeker = document.createElement('div');
        seeker.style.position = 'relative'
        seeker.style.width = '100%'
        seeker.style.height = '10px'
        seeker.style.backgroundColor = 'darkgrey'
        seeker.addEventListener('mousedown', this.pause.bind(this))
        seeker.addEventListener('mouseup', this._seekOn.bind(this))
        return seeker;
    }

    _createPauseScreen() {
        var pauseUrl = 'https://icon-library.com/images/white-play-icon-png/white-play-icon-png-7.jpg'
        var pauseScreen = document.createElement('div');
        pauseScreen.style.position = 'absolute'
        pauseScreen.style.width = '100%'
        pauseScreen.style.height = '100%'
        pauseScreen.style.backgroundColor = '#00000085'
        pauseScreen.style.top = '0px';
        pauseScreen.style.left = '0px';
        pauseScreen.style.backgroundImage = `url('${pauseUrl}')`
        pauseScreen.style.backgroundRepeat = "no-repeat"
        pauseScreen.style.backgroundPosition = "center"
        pauseScreen.addEventListener('click', this._togglePlayPause.bind(this))
        return pauseScreen;
    }

    _seekOn(e) {
        try {
            var bounds = e.target.getBoundingClientRect(),
            x = e.clientX,
            diff = x - bounds.left
        
            var index = Math.ceil((diff / bounds.width) * END_OF_VIDEO_INDEX * ROW_COUNT * FRAME_COUNT)
            var seekInfo = this.counterBucket[index]

            this.counter = index;
            this.setCounter = seekInfo[0]
            this.frameCounter = seekInfo[1]
            this.rowCounter = seekInfo[2]
        } finally {
            this.play()
        }
    }

}