<script>
import {h} from "vue";
import icons from './icons'

let d = (svg) => {
    if (!svg) return h('path', {fill: 'currentColor', d: ''})
    let all = svg.match(/ d="[^"]+"/g);
    return [...all].map(r => r.replace(/^ d="|"$/g, '')).map(r => h('path', {
        fill: 'currentColor',
        d: r
    }))
}
export default {
    name: 'e-icon',
    props: {
        type: {
            type: String,
            required: true,
            validator: (v) => Object.keys(icons).includes(v)
        },
        color: String,
        size: {
            type: String,
            default: '1.2em',
        },
        width: {
            type: String,
        },
        height: {
            type: String,
        },
        verticalAlign: {
            type: String,
            default: 'bottom'
        },
    },
    render() {
        return h(
            'i', {
                style: {
                    color: this.color, display: 'inline-block',
                    height: this.height || this.size, width: this.width || this.size,
                    verticalAlign: this.verticalAlign, marginLeft: '0.2em'
                },
                'class': 'e-icon'
            },
            h(
                'svg', {viewBox: '0 0 1024 1024', xmlns: 'http://www.w3.org/2000/svg'},
                d(icons[this.type])
            )
        )
    }
}
</script>