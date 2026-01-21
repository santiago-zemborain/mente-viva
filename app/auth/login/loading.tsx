export default function LoginLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-primary/5 to-background">
      <div className="flex flex-col items-center gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-lg text-muted-foreground">Cargando...</p>
      </div>
    </div>
  )
}
