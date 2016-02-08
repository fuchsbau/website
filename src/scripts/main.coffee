withinViewport = withinviewport

initStellar = ->
  $.stellar(
    horizontalScrolling: false
  )


# ******************************************************************************
# ******************************************************************************
# ******************************************************************************
# * Centering welcome page logo content
# ******************************************************************************
# ******************************************************************************
# ******************************************************************************

imageVideo = $('.image-video')

centralize = ->
  # we provide global page dimensions here,
  # that we can update occasionally if the screen size changes.
  pageHeight = 0
  pageWidth = 0



  changed = (x, y, newX, newY) ->
    !(x == newX && y == newY)

  windowDimensionChange = ->
    newPageHeight = $(window).height()
    newPageWidth = $(window).width()

    if changed(pageWidth, pageHeight, newPageWidth, newPageHeight)
      pageWidth = newPageWidth
      pageHeight = newPageHeight

      imageVideo.height(imageVideo.width()/16*9)

      $('.page-welcome .centralized').center()

      $pictures = $('.picture')
      picture = $pictures[0]

      if picture
        $picture = $(picture)
        pictureWidth = $picture.width()
        $pictures.height((pictureWidth/4) * 3)

  setInterval(windowDimensionChange, 100)

  windowDimensionChange()


# ******************************************************************************
# ******************************************************************************
# ******************************************************************************
# * Show centered Logo Content in Welcome Page
# ******************************************************************************
# ******************************************************************************
# ******************************************************************************

fadeInWelcomeContent = ->
  $('.page-welcome .centralized').fadeIn("slow", centralize).animate opacity: 1

# page-welcome content setup
setTimeout(fadeInWelcomeContent, 450)

# ******************************************************************************
# ******************************************************************************
# ******************************************************************************
# * Meta Navigation Fadein
# ******************************************************************************
# ******************************************************************************
# ******************************************************************************

withinViewport.defaults.top = -100

metaNavInterval = null
checkMetaNavigation = ->
  $staticMetaNav = $('.meta-navigation.static')
  return unless $staticMetaNav.length > 0

  unless $staticMetaNav.is(':within-viewport')
    $staticMetaNav.removeClass('static').addClass('fixed').animate(top: -30)
    clearInterval(metaNavInterval)

metaNavInterval = setInterval(checkMetaNavigation, 1000)


# ******************************************************************************
# ******************************************************************************
# ******************************************************************************
# * Stellar JS init
# ******************************************************************************
# ******************************************************************************
# ******************************************************************************

initStellar()


# ******************************************************************************
# ******************************************************************************
# ******************************************************************************
# * Disclaimer toggle buttons
# ******************************************************************************
# ******************************************************************************
# ******************************************************************************

$('.disclaimer-toggle').on 'click', (e) ->
  $target = $(e.target)
  $target.parent().next('p').show()

$('.disclaimer-toggle-all').on 'click', (e) ->
  $('#disclaimer').find('p').show()


# ******************************************************************************
# ******************************************************************************
# ******************************************************************************
# * Smoothscroll
# ******************************************************************************
# ******************************************************************************
# ******************************************************************************

$('.meta-navigation a').smoothScroll()
$('.gallery a').smoothScroll()


# ******************************************************************************
# ******************************************************************************
# ******************************************************************************
# * PICTURE PRELOADING
# ******************************************************************************
# ******************************************************************************
# ******************************************************************************

onLoadStart = ($picture, $progressBar) ->
  ->
    $picture.addClass('preloading')
    $picture.append($progressBar)

onProgress = ($progress) ->
  (e) ->
    if e.lengthComputable
      width = e.loaded / e.total * 100
      $progress.css('width', "#{width}%")


onLoadEnd = ($picture) ->
  (e) ->
    $picture.removeClass('preloading').addClass('loaded')
    $picture.find('.bar').remove()
    $imageContainer = $('<div class="covering-image"></div>')
    $picture.append($imageContainer)
    imageType = $picture.data('src')[-3..]
    imageType = "#{imageType}+xml" if imageType is 'svg'
    $imageContainer.css('background-image', "url(data:image/#{imageType};base64,#{base64ArrayBuffer(@response)})")

for picture in $('.picture')
  $picture = $(picture)

  $progress = $('<span class="bar-fill" style="width:0"></span>')
  $progressBar = $('<div class="bar"></div>').append($progress)

  request = new XMLHttpRequest()
  request.onloadstart = onLoadStart($picture, $progressBar)
  request.onprogress = onProgress($progress)
  request.onloadend = onLoadEnd($picture)

  request.open("GET", $picture.data('src'), true)
  request.responseType = 'arraybuffer'
  request.send(null)

# ******************************************************************************
# ******************************************************************************
# ******************************************************************************
# * Gallery Details
# ******************************************************************************
# ******************************************************************************
# ******************************************************************************

closeGalleryDetails = ->
  $galleryDetails = null

  (e) ->
    e.preventDefault()
    $galleryDetails ?= $('.gallery-details-content')
    $galleryDetails.animate(height: 0, -> $galleryDetails.css('display', 'none'))

openGalleryImage = ->
  $galleryDetails = null
  $imageContainer = null
  $caption = null

  (e) ->
    $picture = $(e.currentTarget)
    $pictureThumb = $('.covering-image', $picture)
    $pictureCaption = $('.caption', $picture)

    # singelton getters for the same dom objects for details
    $galleryDetails ?= $('.gallery-details-content')
    $imageContainer ?= $('.image-container', $galleryDetails)
    $caption ?= $('.caption', $galleryDetails)

    # replace image
    imgWithUrlWrapper = $pictureThumb.css('background-image')
    img = imgWithUrlWrapper.match(/url\(["']{0,1}(.*)["']{0,1}\)/)

    if img[1]?
      imgUrl = img[1]
      imgUrl = imgUrl.substr(0, imgUrl.length - 1) if imgUrl.substr(imgUrl.length - 1) is '"'

      $img = $("<img/>").attr("src", imgUrl)
      $imageContainer.html($img)

    # replace caption
    $caption.html($pictureCaption.html())

    if $galleryDetails.css('display') is 'none'
      $galleryDetails.css('height', 'auto')
      targetGalleryHeight =  $galleryDetails.outerHeight()
      $galleryDetails.css('height', 0)

      $galleryDetails.css('display', 'block').animate(height: targetGalleryHeight, -> $galleryDetails.css('height', 'auto'))

$(document).on 'click', '.picture.loaded', openGalleryImage()
$(document).on 'click', '.gallery-details .close', closeGalleryDetails()
