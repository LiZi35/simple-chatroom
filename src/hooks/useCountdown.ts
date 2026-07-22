import { ref, onUnmounted } from 'vue'

export const useCountdown = (time: number = 60) => {
    const countdown = ref(0)
    let timer: ReturnType<typeof setInterval> | null = null

    function start() {
        countdown.value = time

        timer = setInterval(() => {
            countdown.value = countdown.value - 1

            if (countdown.value <= 0) {
                stop()
            }
        }, 1000)
    }

    function stop() {
        if (timer) {
            clearInterval(timer)
            timer = null
        }
        countdown.value = 0
    }

    onUnmounted(stop)

    return { countdown, start, stop }
}
