import { Layout, LayoutContent, LayoutHeader } from "@/components/ui/layout"

function App() {
  return (
    <Layout>
      <LayoutHeader>
        <h1 className="text-xl font-bold">Modern WebRTC</h1>
      </LayoutHeader>
      <LayoutContent>
        <div className="flex flex-col items-center justify-center space-y-4">
          <h2 className="text-2xl font-bold">欢迎使用 Modern WebRTC</h2>
          <p className="text-muted-foreground">一个现代化的 WebRTC 视频通话应用</p>
        </div>
      </LayoutContent>
    </Layout>
  )
}

export default App
