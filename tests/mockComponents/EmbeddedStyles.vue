<template>
  <div>
    <component :is="'style'">
      {{ styles }}
    </component>
  </div>
</template>

<script>
const styles = `
.example {
  border: 1px solid #F00;
}
`.trim();

export default {
  name: 'EmbeddedStyles',
  computed: {
    styles: function () {
      return styles;
    }
  }
};
</script>
