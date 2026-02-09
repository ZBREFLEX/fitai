import { Container, Typography, Card, CardContent } from "@mui/material";

export default function BodyComposition() {
  return (
    <Container sx={{ mt: 6 }}>
      <Typography variant="h4" gutterBottom>
        Body Composition Analysis
      </Typography>
      <Card>
        <CardContent>
          Calculates BMI, body fat category and lean body mass to provide
          physiological insights for fitness planning.
        </CardContent>
      </Card>
    </Container>
  );
}
