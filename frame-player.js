var END_OF_VIDEO_INDEX = 6;
var INTERVAL_MS = 100;

class FramePlayer {

    constructor(id) {
        this.id = id;
        this.process = null;
        this.seek = 0;
        this.eventMap = {}
        this.frameChunk = []
        this.play = this.play.bind(this)
        this.pause = this.pause.bind(this)
        this.on = this.on.bind(this)

        this.player = this._createPlayer()
        this.seeker = this._createSeeker()
        this.selector = this._createSelector()
        document.addEventListener("DOMContentLoaded", this.render.bind(this));
    }

    render() {
        this.seeker.appendChild(this.selector);
        var container = document.getElementById(this.id)
        var wrapper = document.createElement('div')
        wrapper.appendChild(this.player)
        wrapper.appendChild(this.seeker)
        container.appendChild(wrapper)
        this.init().then(() => this.play())
    }

    async init() {
        var xhr = [], i;
        var call = function(i){
            xhr[i] = new XMLHttpRequest();
            xhr[i].responseType = 'arraybuffer'
            xhr[i].open("GET", `images/${i}.jpg`, true);
            xhr[i].onreadystatechange = (function(){
                if (xhr[i].readyState === 4 && xhr[i].status === 200){
                    this.frameChunk.push(xhr[i].response)
                }
            }).bind(this);
            xhr[i].send();
        }
        call = call.bind(this)
        for(i = 0; i <= END_OF_VIDEO_INDEX; i++){
            call(i);
        }
        this.eventMap['ondownloadcomplete'] && this.eventMap['ondownloadcomplete']()
    }

    play() {
        this.process = setInterval(() => {
            // this.player.src = `images/${this.seek}.jpg`
            this.player.src = URL.createObjectURL(
                new Blob([this.frameChunk[this.seek]], { type: 'image/jpeg' })
            );
            this.selector.style.width = `${(this.seek / END_OF_VIDEO_INDEX) * 100}%`
            if (this.seek === END_OF_VIDEO_INDEX)
                this.stop()
            else
                this.seek++
        }, INTERVAL_MS)
        this.eventMap['onplay'] && this.eventMap['onplay'](this.seek * INTERVAL_MS)
    }

    pause() {
        Promise.resolve(
            clearInterval(this.process)
        ).then((function () {
            this.process = null
        }).bind(this))
        this.eventMap['onpause'] && this.eventMap['onpause'](this.seek * INTERVAL_MS)
    }

    stop() {
        Promise.resolve(
            clearInterval(this.process)
        ).then((function () {
            this.process = null
            this.seek = 0;
        }).bind(this))
        this.eventMap['onend'] && this.eventMap['onend']()
    }

    on(eventName, callback) {
        this.eventMap[eventName] = callback
        return this;
    }




    _createPlayer() {
        var player = document.createElement('img');
        player.style.width = '100%'
        player.style.height = '100%'
        player.addEventListener('click', this._togglePlayPause.bind(this))
        return player;
    }

    _togglePlayPause() {
        if (this.process)
            this.pause()
        else
            this.play()
    }

    _createSelector() {
        var selector = document.createElement('div')
        selector.style.position = 'absolute';
        selector.style.left = '0px';
        selector.style.top = '0px';
        selector.style.height = '100%';
        selector.style.backgroundColor = 'blue'
        return selector
    }

    _createSeeker() {
        var seeker = document.createElement('div');
        seeker.style.position = 'relative'
        seeker.style.width = '100%'
        seeker.style.height = '10px'
        seeker.style.backgroundColor = 'green'
        seeker.addEventListener('mousedown', this.pause.bind(this))
        seeker.addEventListener('mouseup', this._seekOn.bind(this))
        return seeker;
    }

    _seekOn(e) {
        var bounds = e.target.getBoundingClientRect(),
            x = e.clientX,
            diff = x - bounds.left
        this.seek = Math.floor((diff / bounds.width) * END_OF_VIDEO_INDEX);
        this.play()
    }

}