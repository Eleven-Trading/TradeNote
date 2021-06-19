const dailyMixin = {
    methods: {

        moreLess(param) {
            var tableId = "table" + param
            console.log("table id " + tableId)
            var element = document.getElementById(tableId);
            if (element.classList.contains("d-none")) {
                element.classList.remove("d-none")
            } else {
                element.classList.add("d-none")
            }

        }
    }
}