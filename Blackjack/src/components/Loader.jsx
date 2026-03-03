import { Html, useProgress } from "@react-three/drei"

export default function Loader() {
  const { progress } = useProgress()

  return (
    <Html center>
      <div style={styles.container}>
        <div style={styles.card}>
          <h2 style={styles.title}>Chargement...</h2>
          <div style={styles.barBackground}>
            <div
              style={{
                ...styles.barFill,
                width: `${progress}%`
              }}
            />
          </div>
          <p style={styles.percent}>{progress.toFixed(0)}%</p>
        </div>
      </div>
    </Html>
  )
}

const styles = {
  container: {
    width: "300px",
    textAlign: "center",
    fontFamily: "Montserrat, sans-serif"
  },
  card: {
    background: "rgba(0,0,0,0.8)",
    padding: "25px",
    borderRadius: "12px",
    color: "white",
    boxShadow: "0 0 20px rgba(0,0,0,0.5)"
  },
  title: {
    marginBottom: "15px"
  },
  barBackground: {
    width: "100%",
    height: "12px",
    background: "#222",
    borderRadius: "6px",
    overflow: "hidden"
  },
  barFill: {
    height: "100%",
    background: "linear-gradient(90deg, gold, orange)",
    transition: "width 0.3s ease"
  },
  percent: {
    marginTop: "10px",
    fontSize: "14px"
  }
}