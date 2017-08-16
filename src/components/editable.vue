<template>
    <div ref="content" id="im-editor" @input="getMsg($event.target.innerHTML)" @keyup="getRange" @keydown="watchMap" @mouseup="getRange" @mouseout="getRange" @touchend="getRange" contenteditable="true" data-text="请描述您遇到的问题">
    </div>
</template>
<script>
export default {
    props: ['value', 'content'],
    data() {
        return {

        }
    },
    methods: {
        getMsg(comment) {
            var tempcComment = comment;
            this.$emit('input', tempcComment);
        },
        getRange() {
            this.$emit('range')
        },
        watchMap(e) {
            this.$emit('keyToSend', e)
        }
    },
    watch: {
        content(val) {
            const content = this.$refs.content.innerHTML
            if (val !== content) {
                this.$refs.content.innerHTML = val
            }
        },
    }
}
</script>