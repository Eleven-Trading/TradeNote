const settingsMixin = {
    data() {
        return {
            patternToEdit: null,
        }
    },
    methods: {
        editPattern(param){
            this.patternToEdit = param
            console.log("patternToEdit "+this.patternToEdit)
        }
    }
}