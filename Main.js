class Main {

	constructor (psId, formId, inputId) {
		this.ps = document.getElementById(psId);
		this.form = document.getElementById(formId);
		this.input = document.getElementById(inputId);

		this.form.addEventListener('submit', event => {
			event.preventDefault();
			this.parser.parse(this.input.value);
		});
	}

	addParser (parser) {
		this.parser = parser;
	}

}

const main = new Main('js--ps', 'js--form', 'js--input');
main.addParser(new Parser());