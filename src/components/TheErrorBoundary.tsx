import type { PropsWithChildren } from 'react'
import { Component } from 'react'
import { Translation } from 'react-i18next'

interface ErrorBoundaryState {
  hasError: boolean
}

class TheErrorBoundary extends Component<PropsWithChildren, ErrorBoundaryState> {
  constructor(props: PropsWithChildren) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    // 更新 state 使下一次渲染能够显示降级后的 UI
    return { hasError: true }
  }

  componentDidCatch() {
    // 将错误日志上报给服务器
    // logErrorToServer(error.message)
  }

  render() {
    const { children } = this.props
    const { hasError } = this.state

    if (hasError) {
      // 自定义降级后的 UI 并渲染
      return (
        <div w-screen h-screen flex items-center justify-center>
          <Translation>
            {t => <div>{t('error')}</div>}
          </Translation>
        </div>
      )
    }

    return children
  }
}

export default TheErrorBoundary
