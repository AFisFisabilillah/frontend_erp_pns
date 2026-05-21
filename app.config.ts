import {defineAppConfig} from "nuxt/app";

export default defineAppConfig({
  ui: {

    colors: {
      primary: 'primary',
      secondary: 'primary',
      success: 'success',
      info: 'info',
      warning: 'warning',
      error: 'error',
      neutral: 'dark'
    },
    button: {
      defaultVariants: {
        color: 'primary'
      }
    },
    input: {
      defaultVariants: {
        color: 'primary'
      }
    },
    select: {
      defaultVariants: {
        color: 'primary'
      }
    },
    textarea: {
      defaultVariants: {
        color: 'primary'
      }
    },
    card: {
      slots: {
        root: 'rounded-xl border border-default bg-elevated/80 backdrop-blur-xl'
      }
    }
  }
})
