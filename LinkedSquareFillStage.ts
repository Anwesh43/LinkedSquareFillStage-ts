const w : number = window.innerWidth, h : number = window.innerHeight, LSF_NODES : number = 5
class LinkedSquareFillStage {

    canvas : HTMLCanvasElement = document.createElement('canvas')

    context : CanvasRenderingContext2D

    linkedSquareFill : LinkedSquareFill = new LinkedSquareFill()

    animator : LSFAnimator = new LSFAnimator()

    constructor() {
        this.initCanvas()
    }

    initCanvas() {
        this.canvas.width = w
        this.canvas.height = h
        this.context = this.canvas.getContext('2d')
        document.body.appendChild(this.canvas)
    }

    render() {
        this.context.fillStyle = '#212121'
        this.context.fillRect(0, 0, w, h)
        this.linkedSquareFill.draw(this.context)
    }

    handleTap() {
        this.canvas.onmousedown = () => {
            this.linkedSquareFill.startUpdating(() => {
                this.animator.start(() => {
                    this.render()
                    this.linkedSquareFill.update(() => {
                        this.animator.stop()
                    })
                })
            })
        }
    }

    static init() {
        const curr : LinkedSquareFillStage = new LinkedSquareFillStage()
        curr.render()
        curr.handleTap()
    }
}

class LSFState {

    scale : number = 0

    prevScale : number = 0

    dir : number = 0

    update(stopcb : Function) {
        this.scale += 0.1 * this.dir
        if (Math.abs(this.scale - this.prevScale) > 1) {
            this.scale = this.prevScale + this.dir
            this.dir = 0
            this.prevScale = this.scale
            stopcb()
        }
    }

    startUpdating(startcb : Function) {
        if (this.dir == 0) {
            this.dir = 1 - 2 * this.prevScale
            startcb()
        }
    }
}

class LSFAnimator {

    animated : boolean = false

    interval : number

    start(updatecb : Function) {
        if (!this.animated) {
            this.animated = true
            this.interval = setInterval(() => {
                updatecb()
            }, 50)
        }
    }

    stop() {
        if (this.animated) {
            this.animated = false
            clearInterval(this.interval)
        }
    }
}

class LSFNode {

    next : LSFNode

    prev : LSFNode

    state : LSFState = new LSFState()

    constructor(private i : number) {
        this.addNeighbor()
    }

    addNeighbor() {
        if (this.i < LSF_NODES - 1) {
            this.next = new LSFNode(this.i + 1)
            this.next.prev = this
        }
    }

    draw(context : CanvasRenderingContext2D) {
        context.fillStyle = '#1abc9c'
        const size : number = Math.min(w, h)/(LSF_NODES + 1)
        context.save()
        context.translate(this.i * size, this.i * size)
        context.save()
        context.translate(size, size)
        for (var i = 0; i < 2; i++) {
            const xy : number = (-size + size * this.state.scale) * (1 - i)
            const sf : number = (1 - i) + (this.state.scale) * (2 * i - 1)
            context.save()
            context.fillRect(xy, xy, size * sf,  size * sf)
            context.restore()
        }
        context.restore()
        context.restore()
    }

    update(stopcb : Function) {
        this.state.update(stopcb)
    }

    startUpdating(startcb : Function) {
        this.state.startUpdating(startcb)
    }

    getNext(dir : number, cb : Function) {
        var curr : LSFNode = this.prev
        if (dir == 1) {
            curr = this.next
        }
        if (curr) {
            return curr
        }
        cb()
        return this
    }
}

class LinkedSquareFill {

    curr : LSFNode = new LSFNode(0)

    dir : number = 1

    draw(context : CanvasRenderingContext2D) {
        this.curr.draw(context)
    }

    update(stopcb : Function) {
        this.curr.update(() => {
            this.curr = this.curr.getNext(this.dir, () => {
                this.dir *= -1
            })
            stopcb()
        })
    }

    startUpdating(startcb : Function) {
        this.curr.startUpdating(startcb)
    }
}
