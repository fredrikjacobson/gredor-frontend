<script lang="ts" setup>
/**
 * En central controller för att visa köade meddelande‑modals. Tar reaktivt den
 * översta i kön från en store och visar innehåll med en OK‑knapp.
 */

import { computed, useTemplateRef, ref, watch } from "vue";
import CommonModal from "@/components/common/CommonModal.vue";
import { useModalStore } from "@/components/common/composables/useModalStore.ts";
import CommonWizardButtons from "@/components/common/CommonWizardButtons.vue";
import type { ComponentExposed } from "vue-component-type-helpers";
import linkifyStr from "linkify-string";

const closeButtonDisabled = ref(true);

const { modalDefinitions, popTopModalDefinition } = useModalStore();

const topModalDefinition = computed(() =>
  modalDefinitions.value.length > 0
    ? modalDefinitions.value[modalDefinitions.value.length - 1]
    : null,
);

const modal = useTemplateRef<ComponentExposed<typeof CommonModal>>("modal");

// Delar upp meddelandetexten i block. Rader som inleds med "- " grupperas till
// en punktlista, medan övriga rader blir vanliga stycken. På så sätt kan en
// avsändare (t.ex. SIE-importen) skicka en läsbar lista i stället för en vägg
// av stycken.
type ContentBlock =
  | { type: "list"; items: string[] }
  | { type: "paragraph"; text: string };

const contentBlocks = computed<ContentBlock[]>(() => {
  const lines = (topModalDefinition.value?.text ?? "")
    .split(/\r?\n/)
    .filter((line) => line.trim().length > 0);

  const blocks: ContentBlock[] = [];
  for (const line of lines) {
    const listItemMatch = line.match(/^\s*-\s+(.*)$/);
    if (listItemMatch) {
      const lastBlock = blocks[blocks.length - 1];
      if (lastBlock?.type === "list") {
        lastBlock.items.push(listItemMatch[1]);
      } else {
        blocks.push({ type: "list", items: [listItemMatch[1]] });
      }
    } else {
      blocks.push({ type: "paragraph", text: line });
    }
  }
  return blocks;
});

function nextModal() {
  modal.value?.hide();
  setTimeout(popTopModalDefinition, 500);
}

// Stängknappen ska vara inaktiverad en kort stund efter att modalen visas, för
// att förhindra buggar och oavsiktlig stängning av modalen.
let closeButtonEnableTimeout: number | undefined;

watch(topModalDefinition, (newValue) => {
  if (newValue) {
    closeButtonDisabled.value = true;

    if (closeButtonEnableTimeout != null) {
      clearTimeout(closeButtonEnableTimeout);
    }

    closeButtonEnableTimeout = window.setTimeout(() => {
      closeButtonDisabled.value = false;
    }, 500);
  }
});
</script>

<template>
  <CommonModal
    v-if="topModalDefinition"
    :id="`app-modal-controller-${topModalDefinition.id}`"
    :key="`app-modal-controller-${topModalDefinition.id}`"
    ref="modal"
    show-on-mount
  >
    <div class="message-modal-content">
      <h3 v-if="topModalDefinition.title">{{ topModalDefinition.title }}</h3>
      <!-- eslint-disable vue/no-v-html -->
      <template v-for="(block, index) in contentBlocks" :key="index">
        <ul v-if="block.type === 'list'">
          <li
            v-for="(item, itemIndex) in block.items"
            :key="itemIndex"
            v-html="linkifyStr(item)"
          />
        </ul>
        <p v-else v-html="linkifyStr(block.text)" />
      </template>
      <!-- eslint-enable vue/no-v-html -->
    </div>

    <CommonWizardButtons
      :next-button-disabled="closeButtonDisabled"
      next-button-text="OK"
      previous-button-hidden
      @go-to-next-step="nextModal"
    />
  </CommonModal>
</template>

<style lang="scss" scoped>
@import "@/assets/_variables.scss";

.message-modal-content {
  width: calc(var(--bs-modal-width) * 1.25);

  h3 {
    font-size: $font-size-lg;
  }

  p {
    margin-bottom: $spacing-sm;

    &:last-of-type {
      margin-bottom: 0;
    }
  }

  ul {
    margin-bottom: $spacing-sm;
    padding-left: $spacing-lg;

    &:last-child {
      margin-bottom: 0;
    }

    li {
      margin-bottom: $spacing-xs;

      &:last-child {
        margin-bottom: 0;
      }
    }
  }
}
</style>
