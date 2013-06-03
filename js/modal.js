/* Create a new modal dialog with the given title and contents */
function Modal(title, contents, hashID) {
    
    this.div = null;
    this.eTitle = null;
    this.eContents = null;
    this.eButtons = null;
    
    this.txttitle = title;
    this.txtcontents = contents;
    this.hashID = hashID;
    
    // true iff the modal window is being displayed
    this.displayed = false;
    
    var generateHash = function(length) {
        // generate a random hex hash of given length
        var h = [];
        for (var i=0; i<length; i++)
            h.push((Math.random()*16|0).toString(16));

        return h.join("");
    };

    /* init */
    if ( hashID == null ) this.hashID = "modal" + generateHash(5);
    if ( this.txttitle == null ) this.txttitle = "";
    if ( this.txtcontents == null ) this.txtcontents = "<br />";
    
    // generate the elements for our modal
    this.div = $('<div />');
    this.div.data('themodal', this);
    this.div.attr('id', this.hashID);
    this.div.addClass('modal');
    
    var container = $('<div />');
    this.container = container;
    this.div.append(container);
    this.container.addClass('mcontainer');
    
    var eTitle = $("<h1 />");
    this.eTitle = eTitle;
    this.eTitle.html(this.txttitle);
    this.container.append(eTitle);
    
    var eContents = $("<div />");
    this.eContents = eContents;
    this.container.append(eContents);
    eContents.addClass('mcontent');
    eContents.html(this.txtcontents);
    
    var eButtons = $("<div />");
    this.eButtons = eButtons;
    this.container.append(eButtons);
    eButtons.addClass('mbuttons');
    
    $("body").append(this.div);
}

Modal.method('addbutton', function (text, link, title) {
    /**
     * Add a button to this window
     */    
    if ( link == null ) link = '#';
    if ( title == null ) title = text;
    
    var btn = $("<a />");
    this.eButtons.append(btn);
    btn.attr('href', link);
    btn.attr('title', title);
    btn.html(text);
    
    return btn;
});

Modal.method('show', function () {
    /**
     * Display this modal window
     */
    location.hash = this.hashID;
    this.displayed = true;
});

Modal.method('hide', function () {
    /**
     * Hide this modal window
     */
    location.hash = '';
    this.displayed = false;
});