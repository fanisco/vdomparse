class Parser {

	constructor () {
		this.root = document.createElement('body');
		this.tokens = {
			TAG_START: '<',
			TAG_END: '>',
			TAG_CLOSE: '/',
			WHITESPACE: ' ',
			EQUAL: '=',
			QUOTE: '"',
			LATIN_LETTERS: /[A-Za-z]/
		};
	}

	parse (code) {
		this.clear();
		this.code = code;

		let
			parentNode = null,

			tagStarted = false,
			tagCreated = false,
			tagClosed = true,
			attrStarted = false,
			attrCreated = false,
			attrEquoted = false,
			attrValStarted = false
		;


		for (let i = 0; i < this.code.length; i++) {
			this.index = i;

			let char = this.code[i];

			const
				isTagStart = char === this.tokens.TAG_START,
				isTagEnd = char === this.tokens.TAG_END,
				isTagClose = char === this.tokens.TAG_CLOSE,

				isWhitespace = char === this.tokens.WHITESPACE,
				isLetter = this.tokens.LATIN_LETTERS.test(char),

				isEqual = char === this.tokens.EQUAL,
				isQuote = char === this.tokens.QUOTE
			;

			console.log(
				char,
				tagClosed
			);

			switch (true) {

				// Открытие тега
				case isTagStart:

					// Начало тега
					if (!tagStarted) {
						tagClosed = false;
						tagStarted = true;
						tagCreated = false;
						this.position = i+1;
					}

					break;

				// Закрытие узла
				case isTagClose:
					tagClosed = true;
					tagStarted = false;
					tagCreated = false;
					parentNode = parentNode.parentNode;
					break;

				// Прерывающие символы
				case isWhitespace || isEqual || isTagEnd:

					// Создание тега (<>)
					if ((isWhitespace || isTagEnd) && tagStarted && !tagCreated) {
						tagCreated = true;
						parentNode = this.create(parentNode);
					}

					// Создание аттрибута
					if (attrStarted && !attrCreated) {
						attrCreated = true;
						this.createAttr();
					}

					// Переход от создания аттрибута к его значению (=)
					if (isEqual && attrCreated) {
						attrEquoted = true;
					}

					// Конец объявления тега
					if (isTagEnd) {
						tagStarted = false;
						tagCreated = false;
					}

					break;

				// Кавычка
				case isQuote:

					// Был ли знак равенства
					if (attrEquoted) {

						// Начало содержимого аттрибута (")
						if (!attrValStarted) {
							attrValStarted = true;
							this.position = i+1;
						}

						// Вставка содержимого аттрибута (")
						else {
							attrEquoted = false;
							attrValStarted = false;
							this.setAttr();
						}
					}

					break;

				// Символ латинского алфавита
				case isLetter:

					// Начало аттрибута
					if (tagStarted && tagCreated && !attrStarted) {
						attrStarted = true;
						this.position = i;
					}

					break;

				default:
					console.log(char);
			}
		}

		console.log([this.root], this.stack.elems, this.stack.attrs);
	}

	/**
	 * @param {HTMLElement} [parent]
	 * @return {HTMLElement}
	 * */
	create (parent = null) {
		let tagName = this.cut();
		let elem = document.createElement(tagName);
		this.put(elem);

		if (parent) {
			parent.appendChild(elem);
		} else {
			this.root.appendChild(elem);
		}

		return elem;
	}

	/**
	 * @return void
	 * */
	createAttr () {
		let attr = this.cut();
		let elem = this.pop();
			elem.setAttribute(attr, '');

		this.put(elem);
		this.putAttr(attr);
	}

	/**
	 * @return void
	 * */
	setAttr () {
		let elem = this.pop();
		let attr = this.popAttr();
		let value = this.cut();

		elem.setAttribute(attr, value);

		this.put(elem);
		this.putAttr(attr);
	}

	/**
	 * @return {String}
	 * */
	cut () {
		return this.code.slice(this.position, this.index);
	}

	/**
	 * @param {HTMLElement} elem
	 * */
	put (elem) {
		this.stack.elems.push(elem);
	}

	/**
	 * @param {String} attr
	 * */
	putAttr (attr) {
		this.stack.attrs.push(attr);
	}

	/**
	 * @return {HTMLElement}
	 * */
	pop () {
		return this.stack.elems.pop();
	}

	/**
	 * @return {String}
	 * */
	popAttr () {
		return this.stack.attrs.pop();
	}

	/**
	 * @return void
	 * */
	clear () {
		this.code = null;
		this.index = null;
		this.position = null;
		this.code = null;

		this.stack = {
			elems: [],
			attrs: []
		};
	}
}