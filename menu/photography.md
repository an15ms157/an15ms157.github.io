---
layout: default
title: Photography
category: photography
permalink: /photography
description: "A collection of my photographs."

---
<h1>
  {{ page.title }}
</h1>

<div class="photography-gallery">
  {% assign photo_pages = site.pages | where: "layout", "photo_set" | sort: "title" %}
  {% for photo_page in photo_pages %}
    {% for i in (1..photo_page.photos.size) %}
      {% capture photo_path %}/photos/{{ photo_page.title }}/{{ photo_page.photos.set }}-{{ i }}.jpg{% endcapture %}
      <p>
        <a href="{{ photo_path | relative_url }}">
          <img src="{{ photo_path | relative_url }}" alt="Photo {{ i }} from {{ photo_page.title | escape }}">
        </a>
      </p>
    {% endfor %}
  {% endfor %}
</div>
