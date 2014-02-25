var BoxSeat = {
  list:  0,
  page:  1,
  lists: ["Everyone", "Popular", "Debuts"],
  index: 0,
  shots: [],
  total: 0,

  initialize: function() {
    this.findElements();
    this.bindEventListeners();

    this.fetch().success($.proxy(this.renderShot, this));
  },

  bindEventListeners: function() {
    $(document).keydown($.proxy(this.onKeyDown, this));
  },

  fetch: function() {
    var list = this.lists[this.list].toLowerCase();
    var url  = "http://api.dribbble.com/shots/" + list + "?page=" + this.page + "&per_page=30&callback=?";

    return $.getJSON(url).success($.proxy(this.onFetch, this));
  },

  findElements: function() {
    this.title    = $("header h1");
    this.position = $("footer p").eq(0);
  },

  onFetch: function(response) {
    var shots = $.map(response.shots, function(shot) {
      return {
        url:   shot.url,
        title: shot.title,
        image: shot.image_url
      };
    });

    this.total += response.shots.length;
    this.shots.push.apply(this.shots, shots);
  },

  renderShot: function() {
    var shot  = this.shots[this.index];
    var image = new Image();

    $("section").hide()

    image.src = shot.image;
    image.addEventListener("load", $.proxy(function() {
      this.enabled = true;

      var title = shot.title;

      if (title.length > 32) {
        title = title.substring(0, 32) + "&#8230;";
      }

      $("section")
        .find("h1 a")
          .html(title)
          .attr("href", shot.url)
        .end()
        .find("img")
          .replaceWith($("<img>", {
            src:    shot.image,
            width:  400,
            height: 300
          }))
        .end()
        .show();
    }, this));

    var index = this.numberWithDelimiter(this.index + 1);
    var total = this.numberWithDelimiter(this.total);

    this.position.text(index + " / " + total);
  },

  onKeyDown: function(event) {
    if (!this.enabled) {
      return;
    }

    switch (event.which) {
      case 27: // Escape.
        return $("body").toggleClass("dim");

      case 32: // Space.
        if (event.shiftKey) {
          this.navigateItem(-1);
        } else {
          this.navigateItem(1);
        }

        return;

      case 37: // Left arrow.
        return this.navigateItem(-1);

      case 38: // Up arrow.
        return this.navigateList(-1);

      case 39: // Right arrow.
        return this.navigateItem(1);

      case 40: // Down arrow.
        return this.navigateList(1);
    }
  },

  navigateList: function(direction) {
    var index = this.list + direction;
    var list  = this.lists[index];

    if (!list) {
      index = (direction == 1 ? 0 : this.lists.length - 1);
      list  = this.lists[index];
    }

    $("section").hide()

    this.list    = index;
    this.enabled = false;
    this.reset();
    this.fetch().success($.proxy(this.renderShot, this));
    this.title.text(list);
  },

  navigateItem: function(direction) {
    var index = this.index + direction;

    if (!this.shots[index]) {
      return;
    }

    this.index   = index;
    this.enabled = false;
    this.renderShot();

    if (this.index == this.total - 15) {
      this.page++;
      this.fetch();
    }
  },

  reset: function() {
    this.page  = 1;
    this.index = 0;
    this.shots = [];
    this.total = 0;
  },

  numberWithDelimiter: function(number) {
    return number.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
  }
};

$($.proxy(BoxSeat.initialize, BoxSeat));
