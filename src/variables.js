///
///
/// Set variables
///
///

var 
    CharacterData = window.CharacterData,
    Comment = window.Comment,
    CustomEvent = window.CustomEvent,
    Document = window.Document,
    DocumentFragment = window.DocumentFragment,
    DocumentType = window.DocumentType,
    DOMException = window.DOMException,
    DOMImplementation = window.DOMImplementation,
    Element = window.Element,
    Event = window.Event,
    EventTarget = window.EventTarget,
    Node = window.Node,
    ProcessingInstruction = window.ProcessingInstruction,
    Text = window.Text,
    Window = window.Window,
    // prototypes
    CharacterDataProto = CharacterData && CharacterData.prototype,
    CommentProto = (Comment && Comment.prototype),
    CustomEventProto = (CustomEvent && CustomEvent.prototype),
    DocumentProto = (Document && Document.prototype),
    DocumentFragmentProto = 
        (DocumentFragment && DocumentFragment.prototype),
    DocumentTypeProto = DocumentType && DocumentType.prototype,
    DOMExceptionProto = (DOMException && DOMException.prototype),
    DOMImplementationProto = 
        (DOMImplementation && DOMImplementation.prototype),
    ElementProto = (Element && Element.prototype),
    EventProto = (Event && Event.prototype),
    EventTargetProto = (EventTarget && EventTarget.prototype),
    NodeProto = (Node && Node.prototype),
    ProcessingInstructionProto = 
        (ProcessingInstruction && ProcessingInstruction.prototype),
    TextProto = (Text && Text.prototype),
    WindowProto = (Window && Window.prototype)

/// Punch IE8 into submission
CharacterData || (CharacterData = function () {});
Comment || (Comment = function () {});
CustomEvent || (CustomEvent = function (type, init) { return _CustomEvent(type, init); });
Document || (Document = function () {});
DocumentFragment || (DocumentFragment = function () {});
DocumentType || (DocumentType = function () {});
DOMException || (DOMException = function () {});
DOMImplementation || (DOMImplementation = function () {});
Event || (Event = function (type, init) { return _Event(type, init); });
EventTarget || (EventTarget = function () {});
Node || (Node = function () {});
ProcessingInstruction || (ProcessingInstruction = function () {});
Text || (Text = function () {});
Window || (Window = function () {});

// We need Element.prototype or we have no chance
// Fix eventtarget first
NodeProto || (NodeProto = Element.prototype);

CharacterDataProto || 
    (CharacterDataProto = Object.create(NodeProto));
CommentProto || (CommentProto = Object.create(CharacterDataProto));
DocumentProto || (DocumentProto = HTMLDocument.prototype);
DocumentFragmentProto || 
    (DocumentFragmentProto = Object.create(NodeProto));
DocumentTypeProto ||
    (DocumentTypeProto = Object.create(NodeProto));
DOMExceptionProto || 
    (DOMExceptionProto = {});
DOMImplementationProto || 
    (DOMImplementationProto = {});
EventProto || (EventProto = {});
EventTargetProto || (EventTargetProto = NodeProto);
// CustomEvent needs Event
CustomEventProto || (CustomEventProto = Object.create(EventProto));
ProcessingInstructionProto ||
    (ProcessingInstructionProto = Object.create(CharacterDataProto));
TextProto || (TextProto = Object.create(CharacterDataProto));
WindowProto || (WindowProto = {});

// link prototypes back up
if (CharacterData.prototype !== CharacterDataProto) {
    CharacterData.prototype = CharacterDataProto;
}
// Set the proper .constructor property
if (CharacterDataProto.constructor !== CharacterData) {
    CharacterDataProto.constructor = CharacterData;
}
if (Comment.prototype !== CommentProto) {
    Comment.prototype = CommentProto;   
}
if (CommentProto.constructor !== Comment) {
    CommentProto.constructor = Comment;
}
if (CustomEvent.prototype !== CustomEventProto) {
    CustomEvent.prototype = CustomEventProto;
}
if (CustomEventProto.constructor !== CustomEvent) {
    CustomEventProto.constructor = CustomEvent;
}
if (Document.prototype !== DocumentProto) {
    Document.prototype = DocumentProto;
}
if (DocumentProto.constructor !== Document) {
    DocumentProto.constructor = Document;
}
if (DocumentFragment.prototype !== DocumentFragmentProto) {
    DocumentFragment.prototype = DocumentFragmentProto; 
}
if (DocumentFragmentProto.constructor !== DocumentFragment) {
    DocumentFragmentProto.constructor = DocumentFragment;
}
if (DocumentType.prototype !== DocumentTypeProto) {
    DocumentType.prototype = DocumentTypeProto;
}
if (DocumentTypeProto.constructor !== DocumentType) {
    DocumentTypeProto.constructor = DocumentType;
}
if (DOMException.prototype !== DOMExceptionProto) {
    DOMException.prototype = DOMExceptionProto;
}
if (DOMException.constructor !== DOMException) {
    DOMException.constructor = DOMException;
}
if (DOMImplementation.prototype !== DOMImplementationProto) {
    DOMImplementation.prototype = DOMImplementationProto;
}
if (DOMImplementationProto.constructor !== DOMImplementation) {
    DOMImplementationProto.constructor = DOMImplementation;
}
if (Event.prototype !== EventProto) {
    Event.prototype = EventProto;
}
if (EventProto.constructor !== Event) {
    EventProto.constructor = Event;
}
if (EventTarget.prototype !== EventTargetProto) {
    EventTarget.prototype = EventTargetProto;
}
if (EventTargetProto.constructor !== EventTarget) {
    EventTargetProto.constructor = EventTarget;
}
if (Node.prototype !== NodeProto) {
    Node.prototype = NodeProto;
}
if (NodeProto.constructor !== Node) {
    NodeProto.constructor = Node;
}
if (ProcessingInstruction.prototype !== ProcessingInstructionProto) {
    ProcessingInstruction.prototype = ProcessingInstructionProto;
}
if (ProcessingInstructionProto.constructor !== ProcessingInstruction) {
    ProcessingInstructionProto.constructor = ProcessingInstruction;
}
if (Text.prototype !== TextProto) {
    Text.prototype = TextProto;
}
if (TextProto.constructor !== Text) {
    TextProto.constructor = Text;
}
if (Window.prototype !== WindowProto) {
    Window.prototype = WindowProto;
}
if (WindowProto.constructor !== Window) {
    WindowProto.constructor = Window;
}

//write objects back to global scope
window.CharacterData = CharacterData;
window.Comment = Comment;
window.Document = Document;
window.DocumentFragment = DocumentFragment;
window.DocumentType = DocumentType;
window.DOMImplementation = DOMImplementation;
window.DOMException = DOMException;
window.Event = Event;
window.EventTarget = EventTarget;
window.Node = Node;
window.ProcessingInstruction = ProcessingInstruction;
window.Text = Text;
window.Window = Window;

var HTMLNames = ["HTMLDocument", "HTMLLinkElement", "HTMLElement", "HTMLHtmlElement", "HTMLDivElement", "HTMLAnchorElement", 
"HTMLSelectElement", "HTMLOptionElement", "HTMLInputElement", "HTMLHeadElement", "HTMLSpanElement", "XULElement",
"HTMLBodyElement", "HTMLTableElement", "HTMLTableCellElement", "HTMLTextAreaElement", "HTMLScriptElement", 
"HTMLAudioElement", "HTMLMediaElement", "HTMLParagraphElement", "HTMLButtonElement", "HTMLLIElement", "HTMLUListElement", 
"HTMLFormElement", "HTMLHeadingElement", "HTMLImageElement", "HTMLStyleElement", "HTMLTableRowElement", 
"HTMLTableSectionElement", "HTMLBRElement"];

// extra locals
var HTMLEls = {};
HTMLNames.forEach(function (name) {
    HTMLEls[name] = window[name];
});