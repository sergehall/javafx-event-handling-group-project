package sammple.canvas;

import java.io.IOException;

import javafx.application.Application;
import javafx.beans.value.ObservableValue;
import javafx.event.Event;
import javafx.event.EventHandler;
import javafx.scene.Group;
import javafx.scene.Scene;
import javafx.scene.input.MouseEvent;
import javafx.scene.paint.Color;
import javafx.scene.shape.Circle;
import javafx.scene.shape.Ellipse;
import javafx.scene.shape.Rectangle;
import javafx.scene.text.Text;
import javafx.stage.Stage;

public class App extends Application {

    private Scene scene;
    private Circle circle;
    private Rectangle rectangle;
    private Ellipse ellipse;
    private Text text;

    @Override
    public void start(Stage stage) throws IOException {

        
        circle = new Circle(6);
        circle.setCenterX(100);
        circle.setCenterY(100);
        
        rectangle = new Rectangle(10, 20);
        rectangle.setFill(Color.ORANGE);
        rectangle.setX(50);
        rectangle.setY(50);
        
        ellipse = new Ellipse(75, 45, 45, 25);
        ellipse.setFill(Color.ALICEBLUE);
        ellipse.setStroke(Color.CRIMSON);
        ellipse.setCenterX(scene.getWidth() / 2);
        ellipse.setCenterY(scene.getHeight() / 2);
        
        text = new Text(25, scene.getHeight() - 25, "Circle at: " + circle.getCenterX() + ", " + circle.getCenterY());
        
        Group root = new Group();
        root.getChildren().addAll(circle, rectangle, ellipse, text);

        scene = new Scene(root, 300, 200, Color.LIGHTBLUE);
        scene.widthProperty().addListener(this::processResize);
        scene.heightProperty().addListener(this::processResize);
        scene.setOnMouseClicked(new EventHandler<MouseEvent>() {

			@Override
			public void handle(MouseEvent event) {
				circle.setCenterX(event.getX());
				circle.setCenterY(event.getY());
			}
			
        });
        
        stage.setTitle("Change Listener Demo");
        stage.setScene(scene);
        stage.show();
    }
    
    public void processResize(ObservableValue<? extends Number> property, Object oldValue, Object newValue)
    {
        rectangle.setX(scene.getWidth() / 5);
        rectangle.setY(scene.getHeight() / 5);
        
        ellipse.setCenterX(scene.getWidth() / 2);
        ellipse.setCenterY(scene.getHeight() / 2);
        
        text.setY(scene.getHeight() - 25);
    	text.setText("Circle at: " + circle.getCenterX() + ", " + circle.getCenterY());
    }

    public static void main(String[] args) {
        launch();
    }

}
