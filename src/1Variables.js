///
///
/// Set variables
///
///

var 
	CharacterData = window.CharacterData,
	Comment = window.Comment,
	Document = window.Document,
	DocumentFragment = window.DocumentFragment,
	DocumentType = window.DocumentType,
	DOMImplementation = window.DOMImplementation,
	Element = window.Element,
	Node = window.Node,
	ProcessingInstruction = window.ProcessingInstruction,
	Text = window.Text,
	// prototypes
	CharacterDataProto = CharacterData && CharacterData.prototype,
	CommentProto = (Comment && Comment.prototype),
	DocumentProto = (Document && Document.prototype),
	DocumentFragmentProto = 
		(DocumentFragment && DocumentFragment.prototype),
	DocumentTypeProto = DocumentType && DocumentType.prototype,
	DOMImplementationProto = 
		(DOMImplementation && DOMImplementation.prototype),
	ElementProto = (Element && Element.prototype),
	NodeProto = (Node && Node.prototype),
	ProcessingInstructionProto = 
		(ProcessingInstruction && ProcessingInstruction.prototype),
	TextProto = (Text && Text.prototype);

/// Punch IE8 into submission
CharacterData || (CharacterData = function () {});
Comment || (Comment = function () {});
Document || (Document = function () {});
DocumentFragment || (DocumentFragment = function () {});
DocumentType || (DocumentType = function () {});
DOMImplementation || (DOMImplementation = function () {});
Node || (Node = function () {});
ProcessingInstruction || (ProcessingInstruction = function () {});
Text || (Text = function () {});

// We need Element.prototype or we have no chance
// Fix node first
NodeProto || (NodeProto = Element.prototype);

CharacterDataProto || 
	(CharacterDataProto = Object.create(NodeProto));
CommentProto || (CommentProto = Object.create(CharacterDataProto));
DocumentProto || (DocumentProto = document);
DocumentFragmentProto || 
	(DocumentFragmentProto = Object.create(NodeProto));
DocumentTypeProto ||
	(DocumentTypeProto = Object.create(NodeProto));
DOMImplementationProto || 
	(DOMImplementationProto = document.implementation);
ProcessingInstructionProto ||
	(ProcessingInstructionProto = Object.create(CharacterDataProto));
TextProto || (TextProto = Object.create(CharacterDataProto));

// link prototypes back up
if (CharacterData.prototype !== CharacterDataProto) {
	CharacterData.prototype = CharacterDataProto;
}
// Set the proper .constructor property
if (CharacterDataProto.constructor === Object) {
	CharacterDataProto.constructor = CharacterData;
}
if (Comment.prototype !== CommentProto) {
	Comment.prototype = CommentProto;	
}
if (CommentProto.constructor === Object) {
	CommentProto.constructor = Comment;
}
if (Document.prototype !== DocumentProto) {
	Document.prototype = DocumentProto;
}
if (DocumentProto.constructor === Object) {
	DocumentProto.constructor = Document;
}
if (DocumentFragment.prototype !== DocumentFragmentProto) {
	DocumentFragment.prototype = DocumentFragmentProto;	
}
if (DocumentFragmentProto.constructor === Object) {
	DocumentFragmentProto.constructor = DocumentFragment;
}
if (DocumentType.prototype !== DocumentTypeProto) {
	DocumentType.prototype = DocumentTypeProto;
}
if (DocumentTypeProto.constructor === Object) {
	DocumentTypeProto.constructor = DocumentType;
}
if (DOMImplementation.prototype !== DOMImplementationProto) {
	DOMImplementation.prototype = DOMImplementationProto;
}
if (DOMImplementationProto.constructor === Object) {
	DOMImplementationProto.constructor = DOMImplementation;
}
if (Node.prototype !== NodeProto) {
	Node.prototype = NodeProto;
}
if (NodeProto.constructor === Object) {
	NodeProto.constructor = Node;
}
if (ProcessingInstruction.prototype !== ProcessingInstructionProto) {
	ProcessingInstruction.prototype = ProcessingInstructionProto;
}
if (ProcessingInstructionProto.constructor === Object) {
	ProcessingInstructionProto.constructor = ProcessingInstruction;
}
if (Text.prototype !== TextProto) {
	Text.prototype = TextProto;
}
if (TextProto.constructor === Object) {
	TextProto.constructor = Text;
}

//write objects back to global scope
window.CharacterData = CharacterData;
window.Comment = Comment;
window.Document = Document;
window.DocumentFragment = DocumentFragment;
window.DocumentType = DocumentType;
window.DOMImplementation = DOMImplementation;
window.Node = Node;
window.ProcessingInstruction = ProcessingInstruction;
window.Text = Text;

// extra locals
var HTMLDocument = window.HTMLDocument;